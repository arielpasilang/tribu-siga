/**
 * One-off migration: reads the Markdown files in content/adventures and
 * creates matching `expedition` documents (+ uploaded cover images) in
 * Sanity. Safe to re-run — documents are keyed by a deterministic _id.
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, and a write-enabled
 * SANITY_WRITE_TOKEN in .env (see .env.example). Run with `npm run migrate`.
 */
const fs = require(`fs`)
const path = require(`path`)
const matter = require(`gray-matter`)
require(`dotenv`).config()

const { createClient } = require(`@sanity/client`)
const schemaModule = require(`@sanity/schema`)
const blockToolsModule = require(`@portabletext/block-tools`)
const { JSDOM } = require(`jsdom`)

const Schema = schemaModule.Schema || schemaModule.default || schemaModule
const blockTools = blockToolsModule.default || blockToolsModule

const CONTENT_DIR = path.join(__dirname, `..`, `content`, `adventures`)

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(
      `Missing required env var ${name}. Copy .env.example to .env and fill it in.`
    )
    process.exit(1)
  }
  return value
}

async function main() {
  const projectId = requireEnv(`SANITY_PROJECT_ID`)
  const dataset = process.env.SANITY_DATASET || `production`
  const token = requireEnv(`SANITY_WRITE_TOKEN`)

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: `2024-01-01`,
    useCdn: false,
  })

  // remark/remark-html are ESM-only; dynamic import from this CJS script.
  const { remark } = await import(`remark`)
  const remarkHtml = (await import(`remark-html`)).default

  const compiledSchema = Schema.compile({
    name: `migration`,
    types: [
      {
        name: `expedition`,
        type: `document`,
        fields: [
          {
            name: `body`,
            type: `array`,
            of: [{ type: `block` }],
          },
        ],
      },
    ],
  })
  const blockContentType = compiledSchema
    .get(`expedition`)
    .fields.find(field => field.name === `body`).type

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith(`.md`))

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file)
    const slug = path.basename(file, `.md`)
    const raw = fs.readFileSync(filePath, `utf8`)
    const { data: frontmatter, content } = matter(raw)

    console.log(`Migrating ${slug}...`)

    let coverAsset = null
    if (frontmatter.cover) {
      const coverPath = path.resolve(path.dirname(filePath), frontmatter.cover)
      if (fs.existsSync(coverPath)) {
        coverAsset = await client.assets.upload(
          `image`,
          fs.createReadStream(coverPath),
          { filename: path.basename(coverPath) }
        )
      } else {
        console.warn(`  cover image not found: ${coverPath}`)
      }
    }

    const htmlResult = await remark().use(remarkHtml).process(content)
    const html = String(htmlResult)
    const blocks = blockTools.htmlToBlocks(html, blockContentType, {
      parseHtml: htmlSrc => new JSDOM(htmlSrc).window.document,
    })

    const doc = {
      _id: `expedition-${slug}`,
      _type: `expedition`,
      title: frontmatter.title,
      slug: { _type: `slug`, current: slug },
      date: frontmatter.date,
      dateDisplay: frontmatter.dateDisplay,
      location: frontmatter.location,
      elevation: frontmatter.elevation,
      category: frontmatter.category,
      excerpt: frontmatter.excerpt,
      body: blocks,
    }

    if (coverAsset) {
      doc.cover = {
        _type: `image`,
        asset: { _type: `reference`, _ref: coverAsset._id },
      }
    }

    await client.createOrReplace(doc)
    console.log(`  done: ${doc._id}`)
  }

  console.log(`\nMigrated ${files.length} expedition(s).`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
