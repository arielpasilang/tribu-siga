import { NextResponse } from "next/server"
import { requireUser } from "../../../src/lib/api-auth"
import { getMcpTokenStatus, issueMcpToken, revokeMcpToken } from "../../../src/lib/mcp-token"
import { sanityFailure } from "../../../src/lib/sanity-error"

export const dynamic = "force-dynamic"

export async function GET() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  try {
    return NextResponse.json(await getMcpTokenStatus())
  } catch (error) {
    return sanityFailure(error)
  }
}

export async function POST() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  try {
    return NextResponse.json(await issueMcpToken())
  } catch (error) {
    return sanityFailure(error)
  }
}

export async function DELETE() {
  const auth = await requireUser()
  if (auth.response) return auth.response
  try {
    return NextResponse.json(await revokeMcpToken())
  } catch (error) {
    return sanityFailure(error)
  }
}
