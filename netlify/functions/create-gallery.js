const { sanityWriteClient } = require(`./_shared/sanity`)
const { verifySession } = require(`./_shared/session`)
const { uniqueSlug } = require(`./_shared/slugify`)

// Expects images to already be uploaded (via upload-image.js) — this just
// assembles the document from asset ids, so it stays fast and small
// regardless of how many photos the gallery has.
exports.handler = async event => {
  if (event.httpMethod !== `POST`) {
    return { statusCode: 405, body: `Method Not Allowed` }
  }

  const cookieHeader = event.headers.cookie || event.headers.Cookie
  const username = await verifySession(cookieHeader)
  if (!username) {
    return { statusCode: 401, body: JSON.stringify({ error: `Not authenticated` }) }
  }

  let data
  try {
    data = JSON.parse(event.body || `{}`)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: `Invalid request` }) }
  }

  const { title, date, coverAssetId, images, relatedExpeditionId } = data

  if (!title || !date || !coverAssetId || !Array.isArray(images) || images.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: `Missing required fields` }) }
  }

  const galleryImages = images
    .filter(img => img?.assetId)
    .map(img => {
      const isVideo = img.type === `video`
      return {
        _type: isVideo ? `captionedVideo` : `captionedImage`,
        _key: img.assetId.replace(/[^a-zA-Z0-9]/g, ``).slice(-12),
        asset: { _type: `reference`, _ref: img.assetId },
        caption: img.caption || ``,
        ...(isVideo ? {} : { alt: img.alt || `` }),
      }
    })

  if (galleryImages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: `No valid images provided` }) }
  }

  const client = sanityWriteClient()

  const doc = {
    _type: `gallery`,
    title,
    slug: { _type: `slug`, current: uniqueSlug(title) },
    date,
    coverImage: { _type: `image`, asset: { _type: `reference`, _ref: coverAssetId } },
    images: galleryImages,
  }

  if (relatedExpeditionId) {
    doc.relatedExpedition = { _type: `reference`, _ref: relatedExpeditionId }
  }

  const created = await client.create(doc)

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, id: created._id }),
  }
}
