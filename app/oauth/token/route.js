import { NextResponse } from "next/server"
import { exchangeAuthCode, exchangeRefreshToken, OAuthError, oauthCors } from "../../../src/lib/oauth"

export const dynamic = "force-dynamic"

export function OPTIONS() {
  return oauthCors(new NextResponse(null, { status: 204 }))
}

function oauthError(error) {
  const code = error instanceof OAuthError ? error.code : "invalid_request"
  const status = error instanceof OAuthError ? error.status : 400
  return oauthCors(
    NextResponse.json({ error: code, error_description: error.message || "Token request failed." }, { status })
  )
}

export async function POST(request) {
  const form = await request.formData().catch(() => null)
  const read = name => {
    const value = form?.get(name)
    return typeof value === "string" ? value : ""
  }
  const grant = read("grant_type")
  try {
    if (grant === "authorization_code") {
      const token = await exchangeAuthCode({
        code: read("code"),
        redirectUri: read("redirect_uri"),
        clientId: read("client_id"),
        codeVerifier: read("code_verifier"),
      })
      return oauthCors(NextResponse.json(token))
    }
    if (grant === "refresh_token") {
      const token = await exchangeRefreshToken(read("refresh_token"))
      return oauthCors(NextResponse.json(token))
    }
    throw new OAuthError("unsupported_grant_type", "Use authorization_code or refresh_token.")
  } catch (error) {
    return oauthError(error)
  }
}
