export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function uniqueSlug(text) {
  return `${slugify(text)}-${Date.now().toString(36)}`
}
