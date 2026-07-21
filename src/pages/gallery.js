import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import Layout from "../components/layout"
import Seo from "../components/seo"

const GalleryPage = ({ data }) => {
  const albums = data.allSanityGallery.nodes
  const [openAlbum, setOpenAlbum] = React.useState(null)
  const [photoIndex, setPhotoIndex] = React.useState(0)

  const closeLightbox = React.useCallback(() => setOpenAlbum(null), [])

  const showPrev = React.useCallback(() => {
    setPhotoIndex(i => (openAlbum ? (i - 1 + openAlbum.images.length) % openAlbum.images.length : i))
  }, [openAlbum])

  const showNext = React.useCallback(() => {
    setPhotoIndex(i => (openAlbum ? (i + 1) % openAlbum.images.length : i))
  }, [openAlbum])

  React.useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") showPrev()
      if (e.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [closeLightbox, showPrev, showNext])

  const openGallery = album => {
    setOpenAlbum(album)
    setPhotoIndex(0)
  }

  const photo = openAlbum ? openAlbum.images[photoIndex] : null
  const photoImg = photo ? getImage(photo.asset) : null

  return (
    <Layout>
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
        <div className="gallery-grid">
          {albums.map(album => {
            const cover = getImage(album.coverImage?.asset)
            if (!cover) return null
            return (
              <button
                key={album.id}
                className="gallery-item"
                onClick={() => openGallery(album)}
                aria-label={`View gallery: ${album.title}`}
              >
                <GatsbyImage image={cover} alt={album.title} />
                <span className="caption">
                  {album.title} · {album.images.length} photo
                  {album.images.length === 1 ? "" : "s"}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {openAlbum && photo && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <button className="close" aria-label="Close" onClick={closeLightbox}>
            ✕
          </button>
          {openAlbum.images.length > 1 && (
            <>
              <button
                className="nav-arrow prev"
                aria-label="Previous photo"
                onClick={e => {
                  e.stopPropagation()
                  showPrev()
                }}
              >
                ‹
              </button>
              <button
                className="nav-arrow next"
                aria-label="Next photo"
                onClick={e => {
                  e.stopPropagation()
                  showNext()
                }}
              >
                ›
              </button>
            </>
          )}
          <figure onClick={e => e.stopPropagation()}>
            {photoImg && (
              <GatsbyImage
                image={photoImg}
                alt={photo.alt || openAlbum.title}
                objectFit="contain"
              />
            )}
            <figcaption>
              <span>
                <strong>{openAlbum.title}</strong>
                {photo.caption ? ` · ${photo.caption}` : ""}
                {openAlbum.images.length > 1 &&
                  ` · ${photoIndex + 1}/${openAlbum.images.length}`}
              </span>
              {openAlbum.relatedExpedition && (
                <Link to={`/adventures/${openAlbum.relatedExpedition.slug.current}/`}>
                  Read the story →
                </Link>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </Layout>
  )
}

export const query = graphql`
  query {
    allSanityGallery(sort: { date: DESC }) {
      nodes {
        id
        title
        coverImage {
          asset {
            gatsbyImageData(width: 700, aspectRatio: 1.3333)
          }
        }
        relatedExpedition {
          slug {
            current
          }
        }
        images {
          caption
          alt
          asset {
            gatsbyImageData(width: 1600)
          }
        }
      }
    }
  }
`

export const Head = () => (
  <Seo
    title="Gallery"
    description="Photo albums from Tribu Siga hikes across the Philippines."
  />
)

export default GalleryPage
