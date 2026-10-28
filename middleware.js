import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifyToken } from "./src/lib/session"

export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const user = await verifyToken(token)
  if (user) return NextResponse.next()

  const loginUrl = new URL("/login/", request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}
