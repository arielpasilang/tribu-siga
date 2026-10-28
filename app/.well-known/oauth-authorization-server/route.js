import { NextResponse } from "next/server"
import { authorizationServerMetadata, oauthCors } from "../../../src/lib/oauth"

export const dynamic = "force-dynamic"

export function OPTIONS() {
  return oauthCors(new NextResponse(null, { status: 204 }))
}

export function GET(request) {
  const origin = new URL(request.url).origin
  return oauthCors(NextResponse.json(authorizationServerMetadata(origin)))
}
