function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, `-`)
    .replace(/(^-|-$)/g, ``)
}

// Appends a short suffix so titles reused across documents don't collide
// (the write API doesn't enforce Studio's slug-uniqueness check).
function uniqueSlug(text) {
  return `${slugify(text)}-${Date.now().toString(36)}`
}

module.exports = { slugify, uniqueSlug }
