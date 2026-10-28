import { createHash, randomBytes, timingSafeEqual } from "crypto"
import { MCP_CLIENT_ID } from "./mcp-client"
import { hasActiveConnection, revokeConnections, verifyAccessToken } from "./oauth"
import { writeClient } from "./sanity"

export { MCP_CLIENT_ID }
const DOC_ID = "mcpToken.tribu-siga"
const TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex")
}

function hashesMatch(storedHash, token) {
  const expected = Buffer.from(storedHash)
  const actual = Buffer.from(hashToken(token))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function isActive(doc) {
  if (!doc?.tokenHash || doc.revokedAt) return false
  if (doc.clientId !== MCP_CLIENT_ID) return false
  if (!doc.expiresAt || new Date(doc.expiresAt).getTime() <= Date.now()) return false
  return true
}

export async function getMcpTokenStatus() {
  const doc = await writeClient().getDocument(DOC_ID)
  const manual = isActive(doc)
  const connected = manual || (await hasActiveConnection())
  return {
    clientId: MCP_CLIENT_ID,
    active: connected,
    expiresAt: manual ? doc.expiresAt : null,
  }
}

export async function issueMcpToken() {
  const token = randomBytes(32).toString("hex")
  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt.getTime() + TOKEN_TTL_MS)
  await writeClient().createOrReplace({
    _id: DOC_ID,
    _type: "mcpToken",
    clientId: MCP_CLIENT_ID,
    tokenHash: hashToken(token),
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
  })
  return {
    token,
    clientId: MCP_CLIENT_ID,
    active: true,
    expiresAt: expiresAt.toISOString(),
  }
}

export async function revokeMcpToken() {
  const doc = await writeClient().getDocument(DOC_ID)
  if (isActive(doc)) {
    await writeClient().patch(DOC_ID).set({ revokedAt: new Date().toISOString() }).commit()
  }
  await revokeConnections()
  return { revoked: true, clientId: MCP_CLIENT_ID, active: false, expiresAt: null }
}

export async function verifyMcpToken(token) {
  if (!token) return null
  const access = await verifyAccessToken(token)
  if (access) return access
  const doc = await writeClient().getDocument(DOC_ID)
  if (!isActive(doc) || !hashesMatch(doc.tokenHash, token)) return null
  return { clientId: MCP_CLIENT_ID, expiresAt: doc.expiresAt }
}
