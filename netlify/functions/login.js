const bcrypt = require(`bcryptjs`)
const { sanityReadClient } = require(`./_shared/sanity`)
const { signSession, buildSessionCookie } = require(`./_shared/session`)

exports.handler = async event => {
  if (event.httpMethod !== `POST`) {
    return { statusCode: 405, body: `Method Not Allowed` }
  }

  let username, password
  try {
    ;({ username, password } = JSON.parse(event.body || `{}`))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: `Invalid request` }) }
  }

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Username and password are required` }),
    }
  }

  const genericError = {
    statusCode: 401,
    body: JSON.stringify({ error: `Invalid username or password` }),
  }

  const client = sanityReadClient()
  const user = await client.fetch(
    `*[_type == "user" && username == $username][0]{ username, passwordHash }`,
    { username }
  )
  if (!user) return genericError

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return genericError

  const token = await signSession(user.username)

  return {
    statusCode: 200,
    multiValueHeaders: { "Set-Cookie": [buildSessionCookie(token)] },
    body: JSON.stringify({ ok: true }),
  }
}
