export function tidyText(value) {
  if (!value) return ""
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
}

export function displayTitle(value) {
  return tidyText(value).replace(/\s*->\s*/g, " → ")
}
