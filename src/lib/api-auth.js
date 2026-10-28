import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifyToken } from "./session"

export async function requireUser() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  const user = await verifyToken(token)
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    }
  }
  return { user, response: null }
}
