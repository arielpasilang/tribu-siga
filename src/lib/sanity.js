import { createClient } from "@sanity/client"

export const projectId = process.env.SANITY_PROJECT_ID
export const dataset = process.env.SANITY_DATASET || "production"
const apiVersion = "2024-01-01"

function requireProject() {
  if (!projectId) {
    throw new Error("SANITY_PROJECT_ID is not set. Add it to .env.")
  }
}

export function readClient() {
  requireProject()
  return createClient({
    projectId,
    dataset,
    token: process.env.SANITY_READ_TOKEN,
    apiVersion,
    useCdn: false,
  })
}

export function writeClient() {
  requireProject()
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_WRITE_TOKEN is not set. Add it to .env.")
  }
  return createClient({
    projectId,
    dataset,
    token: process.env.SANITY_WRITE_TOKEN,
    apiVersion,
    useCdn: false,
  })
}
