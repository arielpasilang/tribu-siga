import { NextResponse } from "next/server"
import { requireUser } from "../../../src/lib/api-auth"
import { sanityFailure } from "../../../src/lib/sanity-error"
import { writeClient } from "../../../src/lib/sanity"

function decodeBase64Image(input) {
  const match = /^data:(.+);base64,(.*)$/s.exec(input || "")
  if (match) return Buffer.from(match[2], "base64")
  return Buffer.from(input || "", "base64")
}

export async function POST(request) {
  const auth = await requireUser()
  if (auth.response) return auth.response

  let data
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!data?.base64) {
    return NextResponse.json({ error: "Missing image data" }, { status: 400 })
  }

  const buffer = decodeBase64Image(data.base64)
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Missing image data" }, { status: 400 })
  }

  try {
    const asset = await writeClient().assets.upload("image", buffer, {
      filename: data.filename || "photo.jpg",
    })
    return NextResponse.json({ ok: true, assetId: asset._id })
  } catch (error) {
    return sanityFailure(error)
  }
}
