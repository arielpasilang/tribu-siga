// Accepts either a data: URL ("data:image/jpeg;base64,...") or a bare
// base64 string and returns a Buffer ready for client.assets.upload.
function decodeBase64Image(input) {
  const match = /^data:(.+);base64,(.*)$/s.exec(input || ``)
  if (match) {
    return { contentType: match[1], buffer: Buffer.from(match[2], `base64`) }
  }
  return { contentType: `application/octet-stream`, buffer: Buffer.from(input || ``, `base64`) }
}

module.exports = { decodeBase64Image }
