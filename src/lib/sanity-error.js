import { NextResponse } from "next/server"

export const WRITE_DENIED =
  "Sanity refused this change. The write token needs the Editor role."

export function sanityFailure(error) {
  const denied = error?.statusCode === 401 || error?.statusCode === 403
  return NextResponse.json(
    { error: denied ? WRITE_DENIED : "Could not save to Sanity." },
    { status: denied ? 403 : 502 }
  )
}
