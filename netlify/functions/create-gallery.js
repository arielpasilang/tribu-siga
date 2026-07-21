const { sanityWriteClient } = require(`./_shared/sanity`)
const { verifySession } = require(`./_shared/session`)
const { decodeBase64Image } = require(`./_shared/base64-image`)
const { uniqueSlug } = require(`./_shared/slugify`)

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

  const { title, date, cover, images, relatedExpeditionId } = data

  if (!title || !date || !cover?.base64 || !Array.isArray(images) || images.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: `Missing required fields` }) }
  }

  const client = sanityWriteClient()

  const coverDecoded = decodeBase64Image(cover.base64)
  const coverAsset = await client.assets.upload(`image`, coverDecoded.buffer, {
    filename: cover.filename || `cover.jpg`,
  })

  const uploadedImages = []
  for (const img of images) {
    if (!img?.base64) continue
    const { buffer } = decodeBase64Image(img.base64)
    const asset = await client.assets.upload(`image`, buffer, {
      filename: img.filename || `photo.jpg`,
    })
    uploadedImages.push({
      _type: `captionedImage`,
      _key: asset._id.replace(/[^a-zA-Z0-9]/g, ``).slice(-12),
      asset: { _type: `reference`, _ref: asset._id },
      caption: img.caption || ``,
      alt: img.alt || ``,
    })
  }

  if (uploadedImages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: `No valid images provided` }) }
  }

  const doc = {
    _type: `gallery`,
    title,
    slug: { _type: `slug`, current: uniqueSlug(title) },
    date,
    coverImage: { _type: `image`, asset: { _type: `reference`, _ref: coverAsset._id } },
    images: uploadedImages,
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
