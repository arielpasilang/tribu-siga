// Client-side only (called from form handlers, never during SSR/build):
// downscales an image file and re-encodes it as JPEG so uploads stay well
// under the Netlify Functions request-size limit. Uses an object URL rather
// than FileReader — simpler, and avoids FileReader's flakiness when several
// files are being read concurrently (the gallery form resizes the cover and
// every photo row in parallel via Promise.all).

function isHeic(file) {
  const type = (file.type || "").toLowerCase()
  if (type === "image/heic" || type === "image/heif") return true
  // iPhone HEIC files sometimes get no/generic MIME type from the browser —
  // fall back to the extension (this is what Live Photos export as by default).
  return /\.(heic|heif)$/i.test(file.name || "")
}

async function toJpegBlob(file) {
  if (!isHeic(file)) return file
  // Loaded on demand (it bundles a WASM HEIC decoder) so the common
  // non-HEIC path doesn't pay for it.
  const heic2any = (await import("heic2any")).default
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 })
  return Array.isArray(converted) ? converted[0] : converted
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const img = new Image()
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Could not decode image"))
    }
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.src = objectUrl
  })
}

export async function resizeImageToBase64(file, { maxWidth = 2000, quality = 0.82 } = {}) {
  let workingBlob
  try {
    workingBlob = await toJpegBlob(file)
  } catch {
    throw new Error(`Could not convert HEIC photo "${file.name}" — try exporting it as JPEG first.`)
  }

  const img = await loadImage(workingBlob)
  const scale = Math.min(1, maxWidth / img.width)
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  canvas.getContext("2d").drawImage(img, 0, 0, width, height)

  return {
    base64: canvas.toDataURL("image/jpeg", quality),
    filename: file.name.replace(/\.[^.]+$/, "") + ".jpg",
  }
}
