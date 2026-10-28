import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE = "ts_session"
const MAX_AGE = 60 * 60 * 24 * 7

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function signSession(username) {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifyToken(token) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.sub || null
  } catch {
    return null
  }
}

export function sessionCookieOptions(maxAge = MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  }
}
