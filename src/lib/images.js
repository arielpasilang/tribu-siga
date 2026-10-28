import { dataset, projectId } from "./sanity"

function assetPath(asset) {
  const ref = asset?._ref || asset?._id
  if (!ref?.startsWith("image-")) return null
  const [, id, dimensions, format] = ref.match(/^image-([a-z0-9]+)-(\d+x\d+)-(\w+)$/i) || []
  if (!id || !dimensions || !format) return null
  return `${id}-${dimensions}.${format}`
}

export function imageUrl(image, { width } = {}) {
  const path = assetPath(image?.asset)
  if (!path || !projectId) return image?.asset?.url || null
  const params = new URLSearchParams({ auto: "format" })
  if (width) params.set("w", String(width))
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${path}?${params}`
}

export function hotspotPosition(image) {
  const hotspot = image?.hotspot
  if (!hotspot) return "center"
  return `${(hotspot.x * 100).toFixed(2)}% ${(hotspot.y * 100).toFixed(2)}%`
}
