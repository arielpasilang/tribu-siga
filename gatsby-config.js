module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
      },
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `limelight`,
          `source sans pro\:300,400,400i,700`,
          `roboto slab\:400,300,700,100`,
          `raleway\:300,700,900,500`

           // you can also specify font weights and styles
        ]
      }
    }
  ],
}