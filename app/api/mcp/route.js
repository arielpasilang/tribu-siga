import { NextResponse } from "next/server"
import { handleMcpBody } from "../../../src/lib/mcp-server"
import { verifyMcpToken } from "../../../src/lib/mcp-token"
import { oauthCors } from "../../../src/lib/oauth"

export const dynamic = "force-dynamic"

export function OPTIONS() {
  return oauthCors(new NextResponse(null, { status: 204 }))
}

function unauthorized(request) {
  const origin = new URL(request.url).origin
  return oauthCors(
    NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"`,
        },
      }
    )
  )
}

async function authorize(request) {
  const header = request.headers.get("authorization") || ""
  if (!header.startsWith("Bearer ")) return null
  return verifyMcpToken(header.slice(7).trim())
}

export async function POST(request) {
  const session = await authorize(request)
  if (!session) return unauthorized(request)

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    )
  }

  try {
    const response = await handleMcpBody(body)
    if (!response) return new NextResponse(null, { status: 202 })
    return oauthCors(NextResponse.json(response))
  } catch (error) {
    const id = body && !Array.isArray(body) ? body.id ?? null : null
    return NextResponse.json(
      { jsonrpc: "2.0", id, error: { code: -32603, message: error.message || "MCP request failed" } },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP endpoint accepts POST requests with a Bearer token." },
    { status: 405 }
  )
}
