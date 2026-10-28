import { NextResponse } from "next/server"
import { OAuthError, oauthCors, registerClient } from "../../../src/lib/oauth"

export const dynamic = "force-dynamic"

export function OPTIONS() {
  return oauthCors(new NextResponse(null, { status: 204 }))
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return oauthCors(
      NextResponse.json({ error: "invalid_request", error_description: "Invalid JSON." }, { status: 400 })
    )
  }
  try {
    const client = await registerClient({
      clientName: body.client_name,
      redirectUris: body.redirect_uris,
    })
    return oauthCors(NextResponse.json(client, { status: 201 }))
  } catch (error) {
    const code = error instanceof OAuthError ? error.code : "invalid_request"
    const status = error instanceof OAuthError ? error.status : 400
    return oauthCors(
      NextResponse.json({ error: code, error_description: error.message || "Could not register." }, { status })
    )
  }
}
