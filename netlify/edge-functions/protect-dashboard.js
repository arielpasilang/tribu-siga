import { jwtVerify } from "npm:jose@6"

const COOKIE_NAME = "ts_session"

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : null
}

export default async (request, context) => {
  const token = readCookie(request.headers.get("cookie"), COOKIE_NAME)

  if (token) {
    try {
      const secret = new TextEncoder().encode(Netlify.env.get("SESSION_SECRET"))
      await jwtVerify(token, secret)
      return context.next()
    } catch {
      // fall through to redirect
    }
  }

  const loginUrl = new URL("/login/", request.url)
  return Response.redirect(loginUrl, 302)
}

export const config = {
  path: "/dashboard*",
}
