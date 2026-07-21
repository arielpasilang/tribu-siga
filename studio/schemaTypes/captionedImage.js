import { defineField, defineType } from "sanity"

// Named (not inline) so `caption`/`alt` survive Sanity's GraphQL API
// generation — anonymous inline `{ type: "image", fields: [...] }" array
// members collapse to the plain built-in image type there.
export const captionedImage = defineType({
  name: "captionedImage",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({ name: "alt", title: "Alt text", type: "string" }),
  ],
})
