const { sanityWriteClient } = require(`./_shared/sanity`)
const { verifySession } = require(`./_shared/session`)
const { plainTextToBlocks } = require(`./_shared/portable-text`)
const { decodeBase64Image } = require(`./_shared/base64-image`)
const { uniqueSlug } = require(`./_shared/slugify`)
const { CATEGORIES } = require(`../../shared/categories`)

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

  const { title, date, dateDisplay, location, elevation, category, excerpt, body, cover } = data

  if (!title || !date || !category || !cover?.base64) {
    return { statusCode: 400, body: JSON.stringify({ error: `Missing required fields` }) }
  }

  if (!CATEGORIES.includes(category)) {
    return { statusCode: 400, body: JSON.stringify({ error: `Invalid category` }) }
  }

  const client = sanityWriteClient()

  const { buffer } = decodeBase64Image(cover.base64)
  const asset = await client.assets.upload(`image`, buffer, {
    filename: cover.filename || `cover.jpg`,
  })

  const doc = {
    _type: `expedition`,
    title,
    slug: { _type: `slug`, current: uniqueSlug(title) },
    date,
    dateDisplay: dateDisplay || ``,
    location: location || ``,
    elevation: elevation || ``,
    category,
    excerpt: excerpt || ``,
    cover: { _type: `image`, asset: { _type: `reference`, _ref: asset._id } },
    body: plainTextToBlocks(body),
  }

  const created = await client.create(doc)

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, id: created._id, slug: created.slug.current }),
  }
}
