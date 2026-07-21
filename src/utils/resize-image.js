// Client-side only (called from form handlers, never during SSR/build):
// downscales an image file and re-encodes it as JPEG so uploads stay well
// under the Netlify Functions request-size limit. Uses an object URL rather
// than FileReader — simpler, and avoids FileReader's flakiness when several
// files are being read concurrently (the gallery form resizes the cover and
// every photo row in parallel via Promise.all).
export function resizeImageToBase64(file, { maxWidth = 2000, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Could not decode image "${file.name}"`))
    }

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      try {
        const scale = Math.min(1, maxWidth / img.width)
        const width = Math.round(img.width * scale)
        const height = Math.round(img.height * scale)
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        canvas.getContext("2d").drawImage(img, 0, 0, width, height)
        resolve({
          base64: canvas.toDataURL("image/jpeg", quality),
          filename: file.name.replace(/\.[^.]+$/, "") + ".jpg",
        })
      } catch (err) {
        reject(err)
      }
    }

    img.src = objectUrl
  })
}
