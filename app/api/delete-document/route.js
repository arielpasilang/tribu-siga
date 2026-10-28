import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireUser } from "../../../src/lib/api-auth"
import { sanityFailure } from "../../../src/lib/sanity-error"
import { writeClient } from "../../../src/lib/sanity"

const DELETABLE_TYPES = ["expedition", "gallery"]

export async function POST(request) {
  const auth = await requireUser()
  if (auth.response) return auth.response

  let data
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!data?.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const client = writeClient()
  let doc
  try {
    doc = await client.getDocument(data.id)
  } catch (error) {
    return sanityFailure(error)
  }
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (!DELETABLE_TYPES.includes(doc._type)) {
    return NextResponse.json({ error: "Cannot delete this type of document" }, { status: 403 })
  }

  try {
    const mutations = [{ delete: { id: data.id } }]
    if (doc._type === "expedition") {
      const galleryIds = await client.fetch(`*[_type == "gallery" && relatedExpedition._ref == $id]._id`, {
        id: data.id,
      })
      mutations.unshift(...galleryIds.map(id => ({ delete: { id } })))
    }
    await client.mutate(mutations)
  } catch (error) {
    const blocked = error?.statusCode === 409
    if (blocked) {
      return NextResponse.json(
        { error: "Sanity kept this item because another document still links to it." },
        { status: 409 }
      )
    }
    return sanityFailure(error)
  }
  revalidatePath("/", "layout")

  return NextResponse.json({ ok: true })
}
