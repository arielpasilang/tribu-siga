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
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `adventures`,
        path: `${__dirname}/content/adventures`,
      },
    },
    `gatsby-transformer-remark`,
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
  ],
}
