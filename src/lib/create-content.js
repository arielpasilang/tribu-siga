import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import { plainTextToBlocks } from "./blocks"
import { CATEGORIES } from "./categories"
import { site } from "./site"
import { uniqueSlug } from "./slugify"
import { writeClient } from "./sanity"

const HIKE_CATEGORIES = CATEGORIES.filter(category => category !== "Milestone")
const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const MAX_PHOTOS = 20

function randomKey() {
  return randomBytes(6).toString("hex")
}

function formatLongDate(iso) {
  const [year, month, day] = String(iso).split("-").map(Number)
  if (!year || !month || !day) return ""
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function assertPublicHttpUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error("A photo URL is not valid.")
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Photo URLs must start with http:// or https://.")
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "")
  const privateHost =
    host === "localhost" ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)
  if (privateHost) throw new Error("Photo URLs must be public addresses.")
  return url
}

async function fetchPublicImage(imageUrl, redirects = 0) {
  const url = assertPublicHttpUrl(imageUrl)
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000) })
  if (response.status >= 300 && response.status < 400) {
    if (redirects >= 2) throw new Error("A photo URL redirected too many times.")
    const location = response.headers.get("location")
    if (!location) throw new Error("A photo URL redirected without a new address.")
    return fetchPublicImage(new URL(location, url).href, redirects + 1)
  }
  if (!response.ok) throw new Error(`Could not download a photo (${response.status}).`)
  const type = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase()
  if (!type.startsWith("image/")) throw new Error("A photo URL did not return an image.")
  const advertised = Number(response.headers.get("content-length") || 0)
  if (advertised > MAX_IMAGE_BYTES) throw new Error("A photo is larger than 12MB.")
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length === 0) throw new Error("A photo download was empty.")
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("A photo is larger than 12MB.")
  const filename = decodeURIComponent(url.pathname.split("/").pop() || "photo.jpg").slice(0, 80) || "photo.jpg"
  return { buffer, type, filename }
}

function imageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg"
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png"
  }
  const gif = buffer.length >= 6 ? buffer.toString("ascii", 0, 6) : ""
  if (gif === "GIF87a" || gif === "GIF89a") return "image/gif"
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp"
  }
  return ""
}

function extensionFor(type) {
  if (type === "image/png") return "png"
  if (type === "image/gif") return "gif"
  if (type === "image/webp") return "webp"
  return "jpg"
}

function safeFilename(name, type) {
  const base = String(name || "photo")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return `${base || "photo"}.${extensionFor(type)}`
}

function decodeImageData(data) {
  const raw = String(data || "").trim()
  const payload = raw.includes(",") ? raw.slice(raw.indexOf(",") + 1) : raw
  const buffer = Buffer.from(payload, "base64")
  if (!buffer.length) throw new Error("A photo was empty.")
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("A photo is larger than 12MB.")
  const type = imageType(buffer)
  if (!type) throw new Error("A photo must be a JPEG, PNG, GIF, or WebP image.")
  return { buffer, type }
}

async function storeImage(buffer, filename, contentType) {
  const asset = await writeClient().assets.upload("image", buffer, { filename, contentType })
  return asset._id
}

async function uploadImageFromUrl(imageUrl) {
  const image = await fetchPublicImage(imageUrl)
  return storeImage(image.buffer, image.filename, image.type)
}

async function uploadPhoto(photo) {
  if (photo.data) {
    const image = decodeImageData(photo.data)
    return storeImage(image.buffer, safeFilename(photo.filename, image.type), image.type)
  }
  return uploadImageFromUrl(photo.url)
}

function normalizePhotos(photos) {
  const list = Array.isArray(photos) ? photos : []
  if (list.length > MAX_PHOTOS) throw new Error(`A gallery can include up to ${MAX_PHOTOS} photos.`)
  return list.map(photo => {
    if (typeof photo === "string") return { url: photo.trim(), data: "", filename: "", caption: "" }
    return {
      url: String(photo?.url || "").trim(),
      data: String(photo?.data || "").trim(),
      filename: String(photo?.filename || "").trim(),
      caption: String(photo?.caption || "").trim(),
    }
  })
}

export async function createStory({ kind, ...input }) {
  const title = String(input.title || "").trim()
  const date = String(input.date || "").trim()
  if (!title) throw new Error("A title is required.")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Date must be YYYY-MM-DD.")

  const category = kind === "milestone" ? "Milestone" : String(input.category || "").trim()
  if (kind === "hike" && !HIKE_CATEGORIES.includes(category)) {
    throw new Error(`Category must be one of: ${HIKE_CATEGORIES.join(", ")}.`)
  }
  const elevation = kind === "milestone" ? "" : String(input.elevation || "").trim()
  if (kind === "hike" && !elevation) throw new Error("Elevation is required.")

  const photos = normalizePhotos(input.photos)
  if (photos.some(photo => !photo.url && !photo.data)) {
    throw new Error("Each gallery photo needs an image file or a public url.")
  }
  const coverUrl = String(input.coverUrl || "").trim()
  const coverData = String(input.coverData || "").trim()
  if (!coverUrl && !coverData && photos.length === 0) {
    throw new Error("Add a cover image or at least one gallery photo.")
  }

  let coverAssetId
  let firstPhotoAssetId = ""
  if (coverData) {
    const image = decodeImageData(coverData)
    coverAssetId = await storeImage(image.buffer, safeFilename(input.coverFilename, image.type), image.type)
  } else if (coverUrl) {
    coverAssetId = await uploadImageFromUrl(coverUrl)
  } else {
    coverAssetId = await uploadPhoto(photos[0])
    firstPhotoAssetId = coverAssetId
  }
  const created = await writeClient().create({
    _type: "expedition",
    title,
    slug: { _type: "slug", current: uniqueSlug(title) },
    date,
    dateDisplay: String(input.dateDisplay || "").trim() || formatLongDate(date),
    location: String(input.location || "").trim(),
    elevation,
    category,
    excerpt: String(input.excerpt || "").trim(),
    cover: { _type: "image", asset: { _type: "reference", _ref: coverAssetId } },
    body: plainTextToBlocks(input.body),
  })

  const result = {
    kind,
    id: created._id,
    title,
    slug: created.slug.current,
    url: `${site.url}/adventures/${created.slug.current}`,
    galleryId: null,
    photoCount: 0,
  }

  if (photos.length === 0) {
    revalidatePath("/", "layout")
    return result
  }

  try {
    const images = []
    for (const [index, photo] of photos.entries()) {
      const assetId = index === 0 && firstPhotoAssetId ? firstPhotoAssetId : await uploadPhoto(photo)
      images.push({
        _type: "captionedImage",
        _key: randomKey(),
        asset: { _type: "reference", _ref: assetId },
        caption: photo.caption,
        alt: "",
      })
    }
    const gallery = await writeClient().create({
      _type: "gallery",
      title,
      slug: { _type: "slug", current: uniqueSlug(title) },
      date,
      coverImage: { _type: "image", asset: { _type: "reference", _ref: images[0].asset._ref } },
      images,
      relatedExpedition: { _type: "reference", _ref: created._id },
    })
    result.galleryId = gallery._id
    result.photoCount = images.length
  } catch (error) {
    result.warning = `${kind === "milestone" ? "Milestone" : "Hike"} was saved, but the gallery was not. ${error.message}`
  }

  revalidatePath("/", "layout")
  return result
}
