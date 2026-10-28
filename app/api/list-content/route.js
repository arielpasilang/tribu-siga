import { NextResponse } from "next/server"
import { requireUser } from "../../../src/lib/api-auth"
import { readClient } from "../../../src/lib/sanity"

export async function GET() {
  const auth = await requireUser()
  if (auth.response) return auth.response

  const client = readClient()
  const [expeditions, galleries] = await Promise.all([
    client.fetch(
      `*[_type == "expedition"] | order(date desc) { _id, title, dateDisplay, category, "slug": slug.current }`
    ),
    client.fetch(
      `*[_type == "gallery"] | order(date desc) { _id, title, date, "itemCount": count(images) }`
    ),
  ])

  return NextResponse.json({ expeditions, galleries })
}
