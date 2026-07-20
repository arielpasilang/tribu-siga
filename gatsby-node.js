const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `content/adventures` })
    createNodeField({ node, name: `slug`, value: `/adventures${slug}` })
  }
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: ASC } }) {
        nodes {
          id
          fields {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error loading adventures`, result.errors)
    return
  }

  const adventures = result.data.allMarkdownRemark.nodes
  adventures.forEach((node, index) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/adventure.js`),
      context: {
        id: node.id,
        previousId: index === 0 ? null : adventures[index - 1].id,
        nextId: index === adventures.length - 1 ? null : adventures[index + 1].id,
      },
    })
  })
}
