import { createHash, randomBytes, timingSafeEqual } from "crypto"
import { MCP_CLIENT_ID } from "./mcp-client"
import { writeClient } from "./sanity"

const CODE_TTL_MS = 5 * 60 * 1000
const ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000
const REFRESH_TTL_MS = 180 * 24 * 60 * 60 * 1000

const CLAUDE_REDIRECTS = new Set([
  "https://claude.ai/api/mcp/auth_callback",
  "https://claude.com/api/mcp/auth_callback",
])

export class OAuthError extends Error {
  constructor(code, description, status = 400) {
    super(description)
    this.code = code
    this.status = status
  }
}

export function oauthCors(response) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, MCP-Protocol-Version")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
  response.headers.set("Cache-Control", "no-store")
  return response
}

export function mcpResource(origin) {
  return `${origin}/api/mcp`
}

export function authorizationServerMetadata(origin) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["mcp"],
  }
}

export function protectedResourceMetadata(origin) {
  return {
    resource: mcpResource(origin),
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: ["mcp"],
  }
}

export function isAllowedRedirect(uri) {
  let url
  try {
    url = new URL(uri)
  } catch {
    return false
  }
  if (url.username || url.password || url.hash) return false
  const host = url.hostname.toLowerCase()
  if (url.protocol === "http:" && (host === "127.0.0.1" || host === "localhost")) return true
  if (url.protocol !== "https:") return false
  return CLAUDE_REDIRECTS.has(`${url.origin}${url.pathname}`)
}

function hashValue(value) {
  return createHash("sha256").update(value).digest("hex")
}

function hashesMatch(storedHash, value) {
  const expected = Buffer.from(storedHash)
  const actual = Buffer.from(hashValue(value))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export function verifyPkce(verifier, challenge) {
  if (!verifier || !challenge) return false
  const hashed = createHash("sha256").update(verifier).digest("base64url")
  return hashed === challenge
}

export async function resolveClient(clientId, redirectUri) {
  if (!clientId) throw new OAuthError("invalid_request", "A client_id is required.")
  if (!isAllowedRedirect(redirectUri)) {
    throw new OAuthError("invalid_request", "That return address is not allowed.", 400)
  }
  if (clientId === MCP_CLIENT_ID) return { clientId, clientName: "This connector" }
  const doc = await writeClient().getDocument(`oauthClient.${clientId}`)
  if (!doc?.redirectUris?.includes(redirectUri)) {
    throw new OAuthError("invalid_client", "Unknown client.", 401)
  }
  return { clientId, clientName: doc.clientName || "An app" }
}

export async function registerClient({ clientName, redirectUris }) {
  const uris = [...new Set((redirectUris || []).map(uri => String(uri)))]
  if (uris.length === 0) throw new OAuthError("invalid_redirect_uri", "A redirect URI is required.")
  if (uris.some(uri => !isAllowedRedirect(uri))) {
    throw new OAuthError("invalid_redirect_uri", "That return address is not allowed.")
  }
  const clientId = `ts${randomBytes(12).toString("hex")}`
  const name = String(clientName || "MCP client").trim().slice(0, 80) || "MCP client"
  await writeClient().create({
    _id: `oauthClient.${clientId}`,
    _type: "oauthClient",
    clientId,
    clientName: name,
    redirectUris: uris,
  })
  return {
    client_id: clientId,
    client_name: name,
    redirect_uris: uris,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  }
}

export async function createAuthCode({ clientId, redirectUri, codeChallenge, username }) {
  const code = randomBytes(32).toString("hex")
  await writeClient().create({
    _id: `oauthCode.${hashValue(code)}`,
    _type: "oauthCode",
    clientId,
    redirectUri,
    codeChallenge,
    username,
    expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  })
  return code
}

async function issueTokenPair({ clientId, username }) {
  const accessToken = randomBytes(32).toString("hex")
  const refreshToken = randomBytes(32).toString("hex")
  const accessExpires = new Date(Date.now() + ACCESS_TTL_MS)
  const refreshExpires = new Date(Date.now() + REFRESH_TTL_MS)
  await writeClient().create({
    _id: `mcpAccess.${hashValue(accessToken)}`,
    _type: "mcpAccess",
    clientId,
    username,
    expiresAt: accessExpires.toISOString(),
    revokedAt: null,
  })
  await writeClient().create({
    _id: `mcpRefresh.${hashValue(refreshToken)}`,
    _type: "mcpRefresh",
    clientId,
    username,
    expiresAt: refreshExpires.toISOString(),
    revokedAt: null,
  })
  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: Math.floor(ACCESS_TTL_MS / 1000),
    refresh_token: refreshToken,
  }
}

export async function exchangeAuthCode({ code, redirectUri, clientId, codeVerifier }) {
  if (!code || !codeVerifier) throw new OAuthError("invalid_request", "Missing code or code verifier.")
  const id = `oauthCode.${hashValue(code)}`
  const doc = await writeClient().getDocument(id)
  if (!doc || new Date(doc.expiresAt).getTime() <= Date.now()) {
    throw new OAuthError("invalid_grant", "That code has expired.")
  }
  if (doc.clientId !== clientId || doc.redirectUri !== redirectUri || !verifyPkce(codeVerifier, doc.codeChallenge)) {
    throw new OAuthError("invalid_grant", "The code could not be verified.")
  }
  await writeClient().delete(id)
  return issueTokenPair({ clientId: doc.clientId, username: doc.username })
}

export async function exchangeRefreshToken(refreshToken) {
  if (!refreshToken) throw new OAuthError("invalid_request", "Missing refresh token.")
  const id = `mcpRefresh.${hashValue(refreshToken)}`
  const doc = await writeClient().getDocument(id)
  if (!doc || doc.revokedAt || new Date(doc.expiresAt).getTime() <= Date.now()) {
    throw new OAuthError("invalid_grant", "That refresh token is no longer valid.")
  }
  await writeClient().delete(id)
  return issueTokenPair({ clientId: doc.clientId, username: doc.username })
}

export async function verifyAccessToken(token) {
  if (!token) return null
  const doc = await writeClient().getDocument(`mcpAccess.${hashValue(token)}`)
  if (!doc || doc.revokedAt || !doc.expiresAt || new Date(doc.expiresAt).getTime() <= Date.now()) return null
  return { clientId: doc.clientId || MCP_CLIENT_ID, expiresAt: doc.expiresAt, username: doc.username }
}

export async function hasActiveConnection() {
  const id = await writeClient().fetch(
    `*[_type == "mcpAccess" && revokedAt == null && expiresAt > $now][0]._id`,
    { now: new Date().toISOString() }
  )
  return Boolean(id)
}

export async function revokeConnections() {
  const client = writeClient()
  const ids = await client.fetch(
    `*[_type in ["mcpAccess", "mcpRefresh"] && revokedAt == null]._id`
  )
  if (!ids.length) return
  const revokedAt = new Date().toISOString()
  await client.mutate(ids.map(id => ({ patch: { id, set: { revokedAt } } })))
}
