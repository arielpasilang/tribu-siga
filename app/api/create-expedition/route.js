import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireUser } from "../../../src/lib/api-auth"
import { plainTextToBlocks } from "../../../src/lib/blocks"
import { CATEGORIES } from "../../../src/lib/categories"
import { sanityFailure } from "../../../src/lib/sanity-error"
import { writeClient } from "../../../src/lib/sanity"
import { uniqueSlug } from "../../../src/lib/slugify"

export async function POST(request) {
  const auth = await requireUser()
  if (auth.response) return auth.response

  let data
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { title, date, dateDisplay, location, elevation, category, excerpt, body, coverAssetId } = data
  if (!title || !date || !category || !coverAssetId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }

  let created
  try {
    created = await writeClient().create({
      _type: "expedition",
      title,
      slug: { _type: "slug", current: uniqueSlug(title) },
      date,
      dateDisplay: dateDisplay || "",
      location: location || "",
      elevation: elevation || "",
      category,
      excerpt: excerpt || "",
      cover: { _type: "image", asset: { _type: "reference", _ref: coverAssetId } },
      body: plainTextToBlocks(body),
    })
  } catch (error) {
    return sanityFailure(error)
  }

  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, id: created._id, slug: created.slug.current })
}
