import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Seo = ({ title, description }) => {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)

  const meta = site.siteMetadata
  const fullTitle = title ? `${title} · ${meta.title}` : meta.title
  const desc = description || meta.description

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <html lang="en" />
    </>
  )
}

export default Seo
