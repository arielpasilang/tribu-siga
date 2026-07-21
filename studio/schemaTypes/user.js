import { defineField, defineType } from "sanity"

export const user = defineType({
  name: "user",
  title: "User",
  type: "document",
  fields: [
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "passwordHash",
      title: "Password hash",
      description: "Set via `npm run create-user` — never edit this by hand.",
      type: "string",
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "username",
    },
  },
})
