import * as React from "react"
import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const AdventureCard = ({ adventure }) => {
  const cover = getImage(adventure.cover?.asset)
  const path = `/adventures/${adventure.slug.current}/`

  return (
    <article className="adventure-card">
      <div className="cover">
        {cover && <GatsbyImage image={cover} alt={adventure.title} />}
      </div>
      <div className="body">
        <div className="meta">
          <span className="chip">{adventure.category}</span>
          <span>{adventure.dateDisplay}</span>
        </div>
        <h3>
          <Link to={path}>{adventure.title}</Link>
        </h3>
        <p className="excerpt">{adventure.excerpt}</p>
        <div className="foot">
          <span>{adventure.location}</span>
          <span>{adventure.elevation}</span>
        </div>
      </div>
    </article>
  )
}

export default AdventureCard
