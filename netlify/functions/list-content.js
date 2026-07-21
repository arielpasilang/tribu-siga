const { sanityReadClient } = require(`./_shared/sanity`)
const { verifySession } = require(`./_shared/session`)

// Fetched fresh on every dashboard load (not Gatsby's build-time data,
// which would stay stale until the next deploy) so the table reflects
// adds/deletes immediately.
exports.handler = async event => {
  if (event.httpMethod !== `GET`) {
    return { statusCode: 405, body: `Method Not Allowed` }
  }

  const cookieHeader = event.headers.cookie || event.headers.Cookie
  const username = await verifySession(cookieHeader)
  if (!username) {
    return { statusCode: 401, body: JSON.stringify({ error: `Not authenticated` }) }
  }

  const client = sanityReadClient()

  const [expeditions, galleries] = await Promise.all([
    client.fetch(
      `*[_type == "expedition"] | order(date desc) { _id, title, dateDisplay, category, "slug": slug.current }`
    ),
    client.fetch(
      `*[_type == "gallery"] | order(date desc) { _id, title, date, "itemCount": count(images) }`
    ),
  ])

  return {
    statusCode: 200,
    body: JSON.stringify({ expeditions, galleries }),
  }
}
