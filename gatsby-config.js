require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `Tribu Siga Mountaineers`,
    description: `A tribe of mountain enthusiasts from Cebu, Philippines. Camaraderie, Leave No Trace, and a thousand stories from the summits we chase.`,
    siteUrl: `https://tribusiga.com`,
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-sanity`,
      options: {
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET || `production`,
        token: process.env.SANITY_READ_TOKEN,
        watchMode: process.env.NODE_ENV === `development`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Tribu Siga Mountaineers`,
        short_name: `Tribu Siga`,
        start_url: `/`,
        background_color: `#0d1210`,
        theme_color: `#e8973a`,
        display: `standalone`,
        icon: `src/images/logo.jpg`,
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        excludes: [`/dashboard`, `/dashboard/*`, `/login`, `/login/*`],
      },
    },
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        host: `https://tribusiga.com`,
        sitemap: `https://tribusiga.com/sitemap-index.xml`,
        policy: [{ userAgent: `*`, disallow: [`/dashboard`] }],
      },
    },
  ],
}
