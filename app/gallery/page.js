import GalleryBrowser from "../../src/components/gallery-browser"
import { getGalleries } from "../../src/lib/content"

export const revalidate = 60

export const metadata = {
  title: "Gallery",
  description: "Photo albums from Tribu Siga hikes across the Philippines.",
}

export default async function GalleryPage() {
  const albums = await getGalleries()

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Looking back</span>
          <h1 className="display">Gallery</h1>
          <p className="lead">
            Photo albums from the trail — click an album to browse the full
            set, and follow through to the hike it belongs to.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <GalleryBrowser albums={albums} />
      </section>
    </>
  )
}
