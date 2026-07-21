const { createClient } = require(`@sanity/client`)

function baseConfig(token) {
  return {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || `production`,
    token,
    apiVersion: `2024-01-01`,
    useCdn: false,
  }
}

function sanityReadClient() {
  return createClient(baseConfig(process.env.SANITY_READ_TOKEN))
}

function sanityWriteClient() {
  return createClient(baseConfig(process.env.SANITY_WRITE_TOKEN))
}

module.exports = { sanityReadClient, sanityWriteClient }
