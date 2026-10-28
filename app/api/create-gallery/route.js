import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireUser } from "../../../src/lib/api-auth"
import { sanityFailure } from "../../../src/lib/sanity-error"
import { writeClient } from "../../../src/lib/sanity"
import { uniqueSlug } from "../../../src/lib/slugify"

export async function POST(request) {
  const auth = await requireUser()
  if (auth.response) return auth.response

  let data
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { title, date, coverAssetId, images, relatedExpeditionId } = data
  if (!title || !date || !coverAssetId || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const galleryImages = images
    .filter(image => image?.assetId)
    .map(image => {
      const isVideo = image.type === "video"
      return {
        _type: isVideo ? "captionedVideo" : "captionedImage",
        _key: image.assetId.replace(/[^a-zA-Z0-9]/g, "").slice(-12),
        asset: { _type: "reference", _ref: image.assetId },
        caption: image.caption || "",
        ...(isVideo ? {} : { alt: image.alt || "" }),
      }
    })

  if (galleryImages.length === 0) {
    return NextResponse.json({ error: "No valid images provided" }, { status: 400 })
  }

  const doc = {
    _type: "gallery",
    title,
    slug: { _type: "slug", current: uniqueSlug(title) },
    date,
    coverImage: { _type: "image", asset: { _type: "reference", _ref: coverAssetId } },
    images: galleryImages,
  }

  if (relatedExpeditionId) {
    doc.relatedExpedition = { _type: "reference", _ref: relatedExpeditionId }
  }

  let created
  try {
    created = await writeClient().create(doc)
  } catch (error) {
    return sanityFailure(error)
  }
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, id: created._id })
}
