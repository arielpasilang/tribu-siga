import { defineField, defineType } from "sanity"

// Named (not inline) for the same reason as captionedImage: Sanity's
// GraphQL API generation drops custom fields from anonymous inline
// array members.
export const captionedVideo = defineType({
  name: "captionedVideo",
  title: "Video",
  type: "file",
  options: { accept: "video/*" },
  fields: [defineField({ name: "caption", title: "Caption", type: "string" })],
})
