import { NextResponse } from "next/server"
import { requireUser } from "../../../src/lib/api-auth"
import { WRITE_DENIED } from "../../../src/lib/sanity-error"
import { dataset, projectId } from "../../../src/lib/sanity"

const MAX_BYTES = 20 * 1024 * 1024

export const maxDuration = 60

export async function POST(request) {
  const auth = await requireUser()
  if (auth.response) return auth.response

  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "Video is too large (20MB max). Trim the clip or lower the export quality." },
      { status: 413 }
    )
  }

  const filename = request.headers.get("x-filename") || "video.mp4"
  const contentType = request.headers.get("content-type") || "video/mp4"
  const token = process.env.SANITY_WRITE_TOKEN
  const body = await request.arrayBuffer()

  if (body.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "Video is too large (20MB max). Trim the clip or lower the export quality." },
      { status: 413 }
    )
  }

  const uploadUrl = `https://${projectId}.api.sanity.io/v2024-01-01/assets/files/${dataset}?filename=${encodeURIComponent(filename)}`
  const sanityRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body,
  })

  if (!sanityRes.ok) {
    const denied = sanityRes.status === 401 || sanityRes.status === 403
    return NextResponse.json(
      { error: denied ? WRITE_DENIED : "Upload failed" },
      { status: denied ? 403 : 502 }
    )
  }

  const data = await sanityRes.json()
  return NextResponse.json({ ok: true, assetId: data.document._id })
}
