// No npm dependencies here on purpose: Netlify's edge function bundler
// (Deno-based) doesn't reliably resolve npm: specifiers in production, so
// HS256 verification is hand-rolled with the platform's built-in Web Crypto
// API instead of importing `jose` (which the Node-side login function still
// uses to sign the same token — this only needs to verify it).

const COOKIE_NAME = "ts_session"

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : null
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) base64 += "="
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function verifyHS256(token, secret) {
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Malformed token")
  const [headerB64, payloadB64, signatureB64] = parts

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  )

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(signatureB64), data)
  if (!valid) throw new Error("Invalid signature")

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)))
  if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new Error("Token expired")
  }
  return payload
}

// Returns the verified payload, or null if there's no valid session.
export async function verifySession(request) {
  const token = readCookie(request.headers.get("cookie"), COOKIE_NAME)
  if (!token) return null
  try {
    return await verifyHS256(token, Netlify.env.get("SESSION_SECRET"))
  } catch {
    return null
  }
}
