const crypto = require(`crypto`)

function randomKey() {
  return crypto.randomBytes(6).toString(`hex`)
}

// Turns a plain textarea value into simple portable-text paragraph blocks
// (blank line = paragraph break). No headings/bold/links — that level of
// formatting still requires Sanity Studio's editor.
function plainTextToBlocks(text) {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(paragraph => ({
      _key: randomKey(),
      _type: `block`,
      style: `normal`,
      markDefs: [],
      children: [{ _key: randomKey(), _type: `span`, text: paragraph, marks: [] }],
    }))
}

module.exports = { plainTextToBlocks }
