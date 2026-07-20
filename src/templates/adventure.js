import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import Layout from "../components/layout"
import Seo from "../components/seo"

const AdventureTemplate = ({ data }) => {
  const post = data.markdownRemark
  const { frontmatter } = post
  const cover = getImage(frontmatter.cover)
  const previous = data.previous
  const next = data.next

  return (
    <Layout>
      <section className="detail-hero">
        {cover && (
          <GatsbyImage
            image={cover}
            alt={frontmatter.title}
            className="hero-bg"
            loading="eager"
            objectFit="cover"
          />
        )}
        <div className="container">
          <span className="chip">{frontmatter.category}</span>
          <h1 className="display">{frontmatter.title}</h1>
        </div>
      </section>

      <div className="container">
        <div className="detail-meta">
          <div className="item">
            <strong>Date</strong>
            {frontmatter.dateDisplay}
          </div>
          <div className="item">
            <strong>Location</strong>
            {frontmatter.location}
          </div>
          <div className="item">
            <strong>Elevation</strong>
            {frontmatter.elevation}
          </div>
        </div>

        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <nav className="prevnext">
          {previous ? (
            <Link to={previous.fields.slug} className="prev">
              <span className="dir">← Earlier climb</span>
              <div className="name">{previous.frontmatter.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={next.fields.slug} className="next">
              <span className="dir">Next climb →</span>
              <div className="name">{next.frontmatter.title}</div>
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
  query ($id: String!, $previousId: String, $nextId: String) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        dateDisplay
        location
        elevation
        category
        excerpt
        cover {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, quality: 80)
          }
        }
      }
    }
    previous: markdownRemark(id: { eq: $previousId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`

export const Head = ({ data }) => (
  <Seo
    title={data.markdownRemark.frontmatter.title}
    description={data.markdownRemark.frontmatter.excerpt}
  />
)

export default AdventureTemplate
