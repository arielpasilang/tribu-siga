import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAuthCode, resolveClient } from "../../../../src/lib/oauth"
import { SESSION_COOKIE, verifyToken } from "../../../../src/lib/session"

export const dynamic = "force-dynamic"

function safeReturn(redirectUri, params) {
  const url = new URL(redirectUri)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }
  return NextResponse.redirect(url, 303)
}

export async function POST(request) {
  const form = await request.formData()
  const read = name => {
    const value = form.get(name)
    return typeof value === "string" ? value : ""
  }
  const redirectUri = read("redirect_uri")
  const clientId = read("client_id")
  const decision = read("decision")

  let client
  try {
    client = await resolveClient(clientId, redirectUri)
  } catch (error) {
    return NextResponse.json({ error: error.message || "This connection could not be approved." }, { status: 400 })
  }

  if (decision !== "approve") {
    return safeReturn(redirectUri, { error: "access_denied", state: read("state") })
  }

  const jar = await cookies()
  const username = await verifyToken(jar.get(SESSION_COOKIE)?.value)
  if (!username) {
    const next = `/oauth/authorize?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: read("code_challenge"),
      code_challenge_method: read("code_challenge_method") || "S256",
      state: read("state"),
      response_type: "code",
    }).toString()}`
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url), 303)
  }

  if (read("code_challenge_method") !== "S256" || !read("code_challenge")) {
    return safeReturn(redirectUri, { error: "invalid_request", state: read("state") })
  }

  const code = await createAuthCode({
    clientId: client.clientId,
    redirectUri,
    codeChallenge: read("code_challenge"),
    username,
  })
  return safeReturn(redirectUri, { code, state: read("state") })
}
