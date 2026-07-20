import * as React from "react"
import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const AdventureCard = ({ adventure }) => {
  const { frontmatter, fields } = adventure
  const cover = getImage(frontmatter.cover)

  return (
    <article className="adventure-card">
      <div className="cover">
        {cover && <GatsbyImage image={cover} alt={frontmatter.title} />}
      </div>
      <div className="body">
        <div className="meta">
          <span className="chip">{frontmatter.category}</span>
          <span>{frontmatter.dateDisplay}</span>
        </div>
        <h3>
          <Link to={fields.slug}>{frontmatter.title}</Link>
        </h3>
        <p className="excerpt">{frontmatter.excerpt}</p>
        <div className="foot">
          <span>{frontmatter.location}</span>
          <span>{frontmatter.elevation}</span>
        </div>
      </div>
    </article>
  )
}

export default AdventureCard
