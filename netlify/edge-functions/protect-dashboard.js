import { verifySession } from "./_shared/session.js"

export default async (request, context) => {
  const session = await verifySession(request)
  if (session) return context.next()

  const loginUrl = new URL("/login/", request.url)
  return Response.redirect(loginUrl, 302)
}

export const config = {
  path: "/dashboard*",
}
