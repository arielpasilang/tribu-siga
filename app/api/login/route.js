import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { readClient } from "../../../src/lib/sanity"
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "../../../src/lib/session"

export async function POST(request) {
  let username
  let password
  try {
    ;({ username, password } = await request.json())
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
  }

  const genericError = NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  const user = await readClient().fetch(
    `*[_type == "user" && username == $username][0]{ username, passwordHash }`,
    { username }
  )
  if (!user) return genericError

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return genericError

  const token = await signSession(user.username)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, sessionCookieOptions())

  return NextResponse.json({ ok: true })
}
