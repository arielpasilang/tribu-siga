import { defineField, defineType } from "sanity"

export const gallery = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Photos & Videos",
      type: "array",
      of: [{ type: "captionedImage" }, { type: "captionedVideo" }],
      validation: Rule => Rule.min(1),
    }),
    defineField({
      name: "relatedExpedition",
      title: "Related hike",
      type: "reference",
      to: [{ type: "expedition" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      subtitle: "date",
    },
  },
})
