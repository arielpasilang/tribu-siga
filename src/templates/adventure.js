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
      dateDisplay
      location
      elevation
      category
      excerpt
      cover {
        asset {
          gatsbyImageData(layout: FULL_WIDTH, placeholder: BLURRED)
        }
      }
      _rawBody(resolveReferences: { maxDepth: 5 })
    }
  }
`

export const Head = ({ data }) => (
  <Seo
    title={data.sanityExpedition.title}
    description={data.sanityExpedition.excerpt}
  />
)

export default AdventureTemplate
