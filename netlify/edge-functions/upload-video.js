import { verifySession } from "./_shared/session.js"

// A regular Netlify Function caps requests at ~6MB, far too small for
// video — this runs as an Edge Function instead (Deno-based, no such
// cap) and streams the raw file straight through to Sanity's upload
// REST endpoint. No @sanity/client here (npm imports in edge functions
// aren't reliable in production — see _shared/session.js) — plain
// fetch() with the write token from Netlify's env instead.
const MAX_BYTES = 20 * 1024 * 1024 // 20MB

export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const session = await verifySession(request)
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength > MAX_BYTES) {
    return Response.json(
      { error: "Video is too large (20MB max). Trim the clip or lower the export quality." },
      { status: 413 }
    )
  }

  const filename = request.headers.get("x-filename") || "video.mp4"
  const contentType = request.headers.get("content-type") || "video/mp4"
  const projectId = Netlify.env.get("SANITY_PROJECT_ID")
  const dataset = Netlify.env.get("SANITY_DATASET") || "production"
  const token = Netlify.env.get("SANITY_WRITE_TOKEN")

  const uploadUrl = `https://${projectId}.api.sanity.io/v2024-01-01/assets/files/${dataset}?filename=${encodeURIComponent(filename)}`

  const sanityRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body: request.body,
    duplex: "half",
  })

  if (!sanityRes.ok) {
    return Response.json({ error: "Upload failed" }, { status: 502 })
  }

  const data = await sanityRes.json()
  return Response.json({ ok: true, assetId: data.document._id })
}

export const config = {
  path: "/api/upload-video",
}
