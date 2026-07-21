const { sanityWriteClient } = require(`./_shared/sanity`)
const { verifySession } = require(`./_shared/session`)

// Only these types can be deleted through this endpoint — without this
// check a request could target the `user` document (locking out login)
// or anything else in the dataset. The document's real _type is looked
// up server-side rather than trusted from the client.
const DELETABLE_TYPES = [`expedition`, `gallery`]

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

  const { id } = data
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: `Missing id` }) }
  }

  const client = sanityWriteClient()

  const doc = await client.getDocument(id)
  if (!doc) {
    return { statusCode: 404, body: JSON.stringify({ error: `Not found` }) }
  }
  if (!DELETABLE_TYPES.includes(doc._type)) {
    return { statusCode: 403, body: JSON.stringify({ error: `Cannot delete this type of document` }) }
  }

  await client.delete(id)

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
