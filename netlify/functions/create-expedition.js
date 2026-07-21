const { sanityWriteClient } = require(`./_shared/sanity`)
const { verifySession } = require(`./_shared/session`)
const { plainTextToBlocks } = require(`./_shared/portable-text`)
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

  const { title, date, dateDisplay, location, elevation, category, excerpt, body, coverAssetId } = data

  if (!title || !date || !category || !coverAssetId) {
    return { statusCode: 400, body: JSON.stringify({ error: `Missing required fields` }) }
  }

  if (!CATEGORIES.includes(category)) {
    return { statusCode: 400, body: JSON.stringify({ error: `Invalid category` }) }
  }

  const client = sanityWriteClient()

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
    cover: { _type: `image`, asset: { _type: `reference`, _ref: coverAssetId } },
    body: plainTextToBlocks(body),
  }

  const created = await client.create(doc)

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, id: created._id, slug: created.slug.current }),
  }
}
