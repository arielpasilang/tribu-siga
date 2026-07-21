const path = require(`path`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const result = await graphql(`
    {
      allSanityExpedition(sort: { date: ASC }) {
        nodes {
          id
          title
          slug {
            current
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error loading expeditions`, result.errors)
    return
  }

  const expeditions = result.data.allSanityExpedition.nodes
  expeditions.forEach((node, index) => {
    const previous = index === 0 ? null : expeditions[index - 1]
    const next = index === expeditions.length - 1 ? null : expeditions[index + 1]

    createPage({
      path: `/adventures/${node.slug.current}/`,
      component: path.resolve(`./src/templates/adventure.js`),
      context: {
        id: node.id,
        previousTitle: previous ? previous.title : null,
        previousSlug: previous ? `/adventures/${previous.slug.current}/` : null,
        nextTitle: next ? next.title : null,
        nextSlug: next ? `/adventures/${next.slug.current}/` : null,
      },
    })
  })
}
