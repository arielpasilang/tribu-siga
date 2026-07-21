// jose@6 is ESM-only, but this file (and its callers) are CommonJS, so it's
// loaded via dynamic import() rather than require() — cached after the
// first call so warm Lambda invocations don't re-import it.
let josePromise
function loadJose() {
  if (!josePromise) josePromise = import(`jose`)
  return josePromise
}

const COOKIE_NAME = `ts_session`
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error(`SESSION_SECRET is not set`)
  return new TextEncoder().encode(secret)
}

async function signSession(username) {
  const { SignJWT } = await loadJose()
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: `HS256` })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret())
}

function buildSessionCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`
}

function buildClearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(`;`)
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : null
}

async function verifySession(cookieHeader) {
  const token = readCookie(cookieHeader, COOKIE_NAME)
  if (!token) return null
  try {
    const { jwtVerify } = await loadJose()
    const { payload } = await jwtVerify(token, getSecret())
    return payload.sub || null
  } catch {
    return null
  }
}

module.exports = {
  COOKIE_NAME,
  signSession,
  buildSessionCookie,
  buildClearCookie,
  verifySession,
}
