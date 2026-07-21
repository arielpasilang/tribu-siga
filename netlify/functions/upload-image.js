const { sanityWriteClient } = require(`./_shared/sanity`)
const { verifySession } = require(`./_shared/session`)
const { decodeBase64Image } = require(`./_shared/base64-image`)

// Uploads a single image and returns its asset id. Kept as its own
// request (rather than bundling every photo into one big create-gallery
// call) so each request stays well under Netlify Functions' payload size
// and execution time limits regardless of how many photos a gallery has.
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

  const { base64, filename } = data
  if (!base64) {
    return { statusCode: 400, body: JSON.stringify({ error: `Missing image data` }) }
  }

  const client = sanityWriteClient()
  const { buffer } = decodeBase64Image(base64)
  const asset = await client.assets.upload(`image`, buffer, {
    filename: filename || `photo.jpg`,
  })

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, assetId: asset._id }),
  }
}
