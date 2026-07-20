import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import AdventureCard from "../components/adventure-card"

const AdventuresPage = ({ data }) => {
  const adventures = data.allMarkdownRemark.nodes
  const categories = ["All", ...new Set(adventures.map(a => a.frontmatter.category))]
  const [active, setActive] = React.useState("All")

  const shown =
    active === "All"
      ? adventures
      : adventures.filter(a => a.frontmatter.category === active)

  return (
    <Layout>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">The logbook</span>
          <h1 className="display">Expeditions</h1>
          <p className="lead">
            Every climb since day one — the majors, the day hikes, the training
            days, and the milestones in between.
          </p>
          <div className="actions" style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "1.8rem" }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={active === cat ? "btn btn-primary" : "btn btn-ghost"}
                style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <div className="card-grid">
          {shown.map(node => (
            <AdventureCard key={node.id} adventure={node} />
          ))}
        </div>
      </section>
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
          location
          elevation
          category
          excerpt
          cover {
            childImageSharp {
              gatsbyImageData(width: 800, aspectRatio: 1.6)
            }
          }
        }
      }
    }
  }
`

export const Head = () => (
  <Seo
    title="Expeditions"
    description="The Tribu Siga logbook — every climb, training day, and milestone since January 2017."
  />
)

export default AdventuresPage
