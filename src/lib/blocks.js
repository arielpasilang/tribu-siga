import { randomBytes } from "crypto"

function randomKey() {
  return randomBytes(6).toString("hex")
}

export function plainTextToBlocks(text) {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(paragraph => ({
      _key: randomKey(),
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: randomKey(), _type: "span", text: paragraph, marks: [] }],
    }))
}
