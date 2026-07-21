import { defineField, defineType } from "sanity"
import { CATEGORIES } from "../../shared/categories"

export const expedition = defineType({
  name: "expedition",
  title: "Hike",
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
      description: "Used for sorting the logbook, oldest to newest.",
      type: "date",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "dateDisplay",
      title: "Date (display)",
      description: 'Human-friendly date shown on the site, e.g. "March 30 – April 1, 2018".',
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "elevation",
      title: "Elevation",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: CATEGORIES,
        layout: "dropdown",
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: Rule => Rule.max(280),
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "cover",
    },
  },
})
