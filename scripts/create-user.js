/**
 * Seed (or reset) the single dashboard login user. The password is only
 * ever read from the environment and hashed immediately — never written to
 * disk in plaintext.
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN,
 * SEED_USERNAME, SEED_PASSWORD. Run with `npm run create-user`.
 */
const bcrypt = require(`bcryptjs`)
require(`dotenv`).config()

const { createClient } = require(`@sanity/client`)

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env var ${name}.`)
    process.exit(1)
  }
  return value
}

async function main() {
  const projectId = requireEnv(`SANITY_PROJECT_ID`)
  const dataset = process.env.SANITY_DATASET || `production`
  const token = requireEnv(`SANITY_WRITE_TOKEN`)
  const username = requireEnv(`SEED_USERNAME`)
  const password = requireEnv(`SEED_PASSWORD`)

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: `2024-01-01`,
    useCdn: false,
  })

  const passwordHash = await bcrypt.hash(password, 12)

  const doc = {
    _id: `user-${username}`,
    _type: `user`,
    username,
    passwordHash,
  }

  await client.createOrReplace(doc)
  console.log(`User "${username}" created/updated (${doc._id}).`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
