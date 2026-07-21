import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

const SOCIAL_LINKS = [
  `https://www.facebook.com/tribusigamountaineers`,
  `https://www.instagram.com/tribusigamountaineers`,
]

function resolveUrl(siteUrl, path) {
  if (!path) return null
  return path.startsWith(`http`) ? path : `${siteUrl}${path}`
}

const Seo = ({ title, description, pathname, image, noindex, article, datePublished }) => {
  const { site, defaultImage, logo } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
      defaultImage: file(relativePath: { eq: "main-banner.jpg" }) {
        childImageSharp {
          resize(width: 1200, height: 630, cropFocus: CENTER) {
            src
          }
        }
      }
      logo: file(relativePath: { eq: "logo.jpg" }) {
        childImageSharp {
          resize(width: 512, height: 512) {
            src
          }
        }
      }
    }
  `)

  const meta = site.siteMetadata
  const fullTitle = title ? `${title} · ${meta.title}` : meta.title
  const desc = description || meta.description
  const url = resolveUrl(meta.siteUrl, pathname || `/`)
  const ogImage = resolveUrl(meta.siteUrl, image || defaultImage.childImageSharp.resize.src)

  const organizationSchema = {
    "@context": `https://schema.org`,
    "@type": `SportsOrganization`,
    name: meta.title,
    url: meta.siteUrl,
    logo: resolveUrl(meta.siteUrl, logo.childImageSharp.resize.src),
    sameAs: SOCIAL_LINKS,
  }

  const articleSchema = article && {
    "@context": `https://schema.org`,
    "@type": `Article`,
    headline: title,
    description: desc,
    image: ogImage,
    datePublished,
    url,
    publisher: {
      "@type": `Organization`,
      name: meta.title,
      logo: {
        "@type": `ImageObject`,
        url: resolveUrl(meta.siteUrl, logo.childImageSharp.resize.src),
      },
    },
  }

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={article ? `article` : `website`} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={meta.title} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {!noindex && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      )}
      {articleSchema && (
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      )}

      <html lang="en" />
    </>
  )
}

export default Seo
