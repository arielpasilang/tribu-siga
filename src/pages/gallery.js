import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import Layout from "../components/layout"
import Seo from "../components/seo"

const GalleryPage = ({ data }) => {
  const shots = data.allMarkdownRemark.nodes.filter(n => n.frontmatter.cover)
  const [selected, setSelected] = React.useState(null)

  React.useEffect(() => {
    const onKey = e => e.key === "Escape" && setSelected(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <Layout>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Looking back</span>
          <h1 className="display">Gallery</h1>
          <p className="lead">
            Moments from the trail — every photo links back to the expedition
            it was taken on. Click any shot to view it full size.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <div className="gallery-grid">
          {shots.map(node => {
            const img = getImage(node.frontmatter.cover)
            if (!img) return null
            return (
              <button
                key={node.id}
                className="gallery-item"
                onClick={() => setSelected(node)}
                aria-label={`View photo from ${node.frontmatter.title}`}
              >
                <GatsbyImage image={img} alt={node.frontmatter.title} />
                <span className="caption">
                  {node.frontmatter.title} · {node.frontmatter.dateDisplay}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {selected && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <button className="close" aria-label="Close" onClick={() => setSelected(null)}>
            ✕
          </button>
          <figure onClick={e => e.stopPropagation()}>
            <GatsbyImage
              image={getImage(selected.frontmatter.coverLarge)}
              alt={selected.frontmatter.title}
              objectFit="contain"
            />
            <figcaption>
              <span>
                <strong>{selected.frontmatter.title}</strong> ·{" "}
                {selected.frontmatter.dateDisplay}
              </span>
              <Link to={selected.fields.slug}>Read the story →</Link>
            </figcaption>
          </figure>
        </div>
      )}
    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          title
          dateDisplay
          cover {
            childImageSharp {
              gatsbyImageData(width: 700, aspectRatio: 1.3333)
            }
          }
          coverLarge: cover {
            childImageSharp {
              gatsbyImageData(width: 1600)
            }
          }
        }
      }
    }
  }
`

export const Head = () => (
  <Seo
    title="Gallery"
    description="Photos from Tribu Siga expeditions across the Philippines."
  />
)

export default GalleryPage
