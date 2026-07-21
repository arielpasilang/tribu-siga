const { buildClearCookie } = require(`./_shared/session`)

exports.handler = async event => {
  if (event.httpMethod !== `POST`) {
    return { statusCode: 405, body: `Method Not Allowed` }
  }

  return {
    statusCode: 200,
    multiValueHeaders: { "Set-Cookie": [buildClearCookie()] },
    body: JSON.stringify({ ok: true }),
  }
}
