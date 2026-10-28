import { hotspotPosition, imageUrl } from "./images"
import { readClient } from "./sanity"

const imageProjection = `{
  hotspot,
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  }
}`

function presentImage(image, width) {
  if (!image?.asset) return null
  const dimensions = image.asset.metadata?.dimensions
  return {
    src: imageUrl(image, { width }),
    lqip: image.asset.metadata?.lqip || null,
    width: dimensions?.width || width || 1600,
    height: dimensions?.height || 1000,
    position: hotspotPosition(image),
  }
}

function presentExpeditionCard(expedition) {
  const cover = presentImage(expedition.cover, 1200)
  return {
    id: expedition._id,
    title: expedition.title,
    slug: expedition.slug,
    date: expedition.date,
    dateDisplay: expedition.dateDisplay,
    location: expedition.location,
    elevation: expedition.elevation,
    category: expedition.category,
    excerpt: expedition.excerpt,
    cover,
  }
}

export async function getExpeditions() {
  const expeditions = await readClient().fetch(
    `*[_type == "expedition"] | order(date desc) {
      _id,
      title,
      "slug": slug.current,
      date,
      dateDisplay,
      location,
      elevation,
      category,
      excerpt,
      cover ${imageProjection}
    }`
  )
  return expeditions.map(presentExpeditionCard)
}

export async function getExpedition(slug) {
  const client = readClient()
  const [order, expedition] = await Promise.all([
    client.fetch(
      `*[_type == "expedition"] | order(date asc) { _id, title, "slug": slug.current }`
    ),
    client.fetch(
      `*[_type == "expedition" && slug.current == $slug][0] {
        _id,
        title,
        "slug": slug.current,
        date,
        dateDisplay,
        location,
        elevation,
        category,
        excerpt,
        cover ${imageProjection},
        body[]{
          ...,
          _type == "image" => {
            ...,
            asset->{ url, metadata { dimensions } }
          }
        }
      }`,
      { slug }
    ),
  ])

  if (!expedition) return null

  const index = order.findIndex(item => item.slug === slug)
  const galleries = await client.fetch(
    `*[_type == "gallery" && relatedExpedition._ref == $id] {
      images[]{
        _key,
        _type,
        caption,
        alt,
        hotspot,
        asset->{
          _id,
          url,
          metadata { lqip, dimensions }
        }
      }
    }`,
    { id: expedition._id }
  )

  const galleryItems = galleries.flatMap(gallery =>
    (gallery.images || []).map(item => {
      const isVideo = item._type === "captionedVideo"
      const image = isVideo ? null : presentImage(item, 1600)
      return {
        key: item._key,
        type: isVideo ? "video" : "image",
        src: isVideo ? item.asset?.url || null : image?.src || null,
        lqip: image?.lqip || null,
        width: image?.width || null,
        height: image?.height || null,
        position: image?.position || "center",
        caption: item.caption || "",
        alt: item.alt || "",
      }
    })
  )

  return {
    expedition: {
      ...presentExpeditionCard(expedition),
      coverLarge: presentImage(expedition.cover, 2400),
      body: expedition.body || [],
    },
    previous: index > 0 ? order[index - 1] : null,
    next: index >= 0 && index < order.length - 1 ? order[index + 1] : null,
    galleryItems: galleryItems.filter(item => item.src),
  }
}

export async function getGalleries() {
  const galleries = await readClient().fetch(
    `*[_type == "gallery"] | order(date desc) {
      _id,
      title,
      date,
      coverImage ${imageProjection},
      relatedExpedition->{ "slug": slug.current, title },
      images[]{
        _key,
        _type,
        caption,
        alt,
        hotspot,
        asset->{
          _id,
          url,
          metadata { lqip, dimensions }
        }
      }
    }`
  )

  return galleries
    .map(gallery => {
      const cover = presentImage(gallery.coverImage, 900)
      if (!cover) return null
      const images = (gallery.images || [])
        .map(item => {
          const isVideo = item._type === "captionedVideo"
          const image = isVideo ? null : presentImage(item, 1600)
          return {
            key: item._key,
            type: isVideo ? "video" : "image",
            src: isVideo ? item.asset?.url || null : image?.src || null,
            lqip: image?.lqip || null,
            width: image?.width || null,
            height: image?.height || null,
            position: image?.position || "center",
            caption: item.caption || "",
            alt: item.alt || "",
          }
        })
        .filter(item => item.src)

      return {
        id: gallery._id,
        title: gallery.title,
        date: gallery.date,
        cover,
        relatedSlug: gallery.relatedExpedition?.slug || null,
        images,
      }
    })
    .filter(Boolean)
}
