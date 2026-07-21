import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PortableText from "../components/portable-text"

const AdventureTemplate = ({ data, pageContext }) => {
  const expedition = data.sanityExpedition
  const cover = getImage(expedition.cover?.asset)
  const { previousTitle, previousSlug, nextTitle, nextSlug } = pageContext

  const galleryItems = data.allSanityGallery.nodes.flatMap(g => g.images)

  const [openIndex, setOpenIndex] = React.useState(null)

  const closeLightbox = React.useCallback(() => setOpenIndex(null), [])

  const showPrev = React.useCallback(() => {
    setOpenIndex(i => (i === null ? i : (i - 1 + galleryItems.length) % galleryItems.length))
  }, [galleryItems.length])

  const showNext = React.useCallback(() => {
    setOpenIndex(i => (i === null ? i : (i + 1) % galleryItems.length))
  }, [galleryItems.length])

  React.useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") showPrev()
      if (e.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [closeLightbox, showPrev, showNext])

  const activeItem = openIndex !== null ? galleryItems[openIndex] : null
  const isActiveVideo = activeItem?.__typename === "SanityCaptionedVideo"
  const activeImg = activeItem && !isActiveVideo ? getImage(activeItem.asset) : null

  return (
    <Layout>
      <section className="detail-hero">
        {cover && (
          <GatsbyImage
            image={cover}
            alt={expedition.title}
            className="hero-bg"
            loading="eager"
            objectFit="cover"
          />
        )}
        <div className="container">
          <span className="chip">{expedition.category}</span>
          <h1 className="display">{expedition.title}</h1>
        </div>
      </section>

      <div className="container">
        <div className="detail-meta">
          <div className="item">
            <strong>Date</strong>
            {expedition.dateDisplay}
          </div>
          <div className="item">
            <strong>Location</strong>
            {expedition.location}
          </div>
          <div className="item">
            <strong>Elevation</strong>
            {expedition.elevation}
          </div>
        </div>

        <article className="prose">
          <PortableText value={expedition._rawBody} />
        </article>

        <nav className="prevnext">
          {previousSlug ? (
            <Link to={previousSlug} className="prev">
              <span className="dir">← Earlier climb</span>
              <div className="name">{previousTitle}</div>
            </Link>
          ) : (
            <span />
          )}
          {nextSlug ? (
            <Link to={nextSlug} className="next">
              <span className="dir">Next climb →</span>
              <div className="name">{nextTitle}</div>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      {galleryItems.length > 0 && (
        <div className="container" style={{ paddingBottom: "5rem" }}>
          <span className="eyebrow">From this hike</span>
          <h2 className="display section-title">Gallery</h2>
          <div className="gallery-grid">
            {galleryItems.map((item, i) => {
              const isVideo = item.__typename === "SanityCaptionedVideo"
              const thumb = isVideo ? null : getImage(item.asset)
              return (
                <button
                  key={i}
                  className="gallery-item"
                  onClick={() => setOpenIndex(i)}
                  aria-label={isVideo ? `Play video` : `View photo`}
                >
                  {isVideo ? (
                    <video src={item.asset?.url} muted playsInline preload="metadata" />
                  ) : (
                    thumb && <GatsbyImage image={thumb} alt={item.alt || expedition.title} />
                  )}
                  {isVideo && (
                    <span className="play-icon" aria-hidden="true">
                      ▶
                    </span>
                  )}
                  {item.caption && <span className="caption">{item.caption}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {activeItem && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button className="close" aria-label="Close" onClick={closeLightbox}>
            ✕
          </button>
          {galleryItems.length > 1 && (
            <>
              <button
                className="nav-arrow prev"
                aria-label="Previous"
                onClick={e => {
                  e.stopPropagation()
                  showPrev()
                }}
              >
                ‹
              </button>
              <button
                className="nav-arrow next"
                aria-label="Next"
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
            {isActiveVideo ? (
              <video
                src={activeItem.asset?.url}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "78vh", borderRadius: "var(--radius)" }}
              />
            ) : (
              activeImg && (
                <GatsbyImage image={activeImg} alt={activeItem.alt || expedition.title} objectFit="contain" />
              )
            )}
            {activeItem.caption && (
              <figcaption>
                <span>{activeItem.caption}</span>
              </figcaption>
            )}
          </figure>
        </div>
      )}

      <div className="container" style={{ padding: "3rem 0 5rem" }}>
        <Link to="/adventures/" className="btn btn-ghost">
          ← Back to the logbook
        </Link>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query ($id: String!) {
    sanityExpedition(id: { eq: $id }) {
      title
      date
      dateDisplay
      location
      elevation
      category
      excerpt
      cover {
        asset {
          gatsbyImageData(layout: FULL_WIDTH, placeholder: BLURRED)
          url
        }
      }
      _rawBody(resolveReferences: { maxDepth: 5 })
    }
    allSanityGallery(filter: { relatedExpedition: { id: { eq: $id } } }) {
      nodes {
        images {
          __typename
          ... on SanityCaptionedImage {
            caption
            alt
            asset {
              gatsbyImageData(width: 1600)
            }
          }
          ... on SanityCaptionedVideo {
            caption
            asset {
              url
            }
          }
        }
      }
    }
  }
`

export const Head = ({ data, location }) => (
  <Seo
    title={data.sanityExpedition.title}
    description={data.sanityExpedition.excerpt}
    pathname={location.pathname}
    image={data.sanityExpedition.cover?.asset?.url}
    article
    datePublished={data.sanityExpedition.date}
  />
)

export default AdventureTemplate
