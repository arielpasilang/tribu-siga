import { CATEGORIES } from "./categories"
import { getExpedition, getExpeditions, getGalleries } from "./content"
import { createStory } from "./create-content"
import { MCP_CLIENT_ID } from "./mcp-token"

const HIKE_CATEGORIES = CATEGORIES.filter(category => category !== "Milestone")

const photoItems = {
  type: "object",
  properties: {
    data: {
      type: "string",
      description:
        "Base64 image bytes for a file the user attached in chat. JPEG, PNG, GIF, or WebP, up to 12MB. Prefer this over a URL when the user dropped a file.",
    },
    filename: { type: "string", description: "Optional file name, such as summit.jpg." },
    url: { type: "string", description: "Public http or https URL, when the photo is already online." },
    caption: { type: "string", description: "Optional caption shown with the photo." },
  },
}

const storyFields = {
  title: { type: "string", description: "Title shown on the logbook." },
  date: { type: "string", description: "Required trip date as YYYY-MM-DD." },
  dateDisplay: {
    type: "string",
    description: "Optional label when the trip covers more than one day, such as March 30 – April 1, 2018.",
  },
  location: { type: "string", description: "Where it happened." },
  excerpt: { type: "string", description: "One or two sentences for the logbook card." },
  body: { type: "string", description: "The story. A blank line starts a new paragraph." },
  coverUrl: {
    type: "string",
    description: "Public image URL used as the cover. If omitted, the first gallery photo is the cover.",
  },
  coverData: {
    type: "string",
    description: "Base64 cover image when the user attached a cover file. JPEG, PNG, GIF, or WebP.",
  },
  coverFilename: { type: "string", description: "Optional file name for coverData." },
  photos: {
    type: "array",
    description:
      "Optional gallery saved with this entry. Each photo is either base64 in data (a file dropped in chat) or a public url.",
    items: photoItems,
  },
}

const PROTOCOL_VERSION = "2025-03-26"

const TOOLS = [
  {
    name: "list_hikes",
    description: "List hikes in the Tribu Siga logbook. Milestones are not included.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_milestones",
    description: "List milestones in the Tribu Siga logbook.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_hike",
    description: "Get one hike or milestone by its URL slug, including its story and photo captions.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Slug from the hike URL, such as mt-talinis-major-climb." },
      },
      required: ["slug"],
    },
  },
  {
    name: "list_galleries",
    description: "List photo galleries, including the hike each album belongs to.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "add_hike",
    description:
      "Add a hike to the logbook. Date and elevation are required. Include photos to save its gallery in the same step. When the user attaches image files, send each file as base64 in photos[].data. Public image URLs still work.",
    inputSchema: {
      type: "object",
      properties: {
        ...storyFields,
        category: {
          type: "string",
          enum: HIKE_CATEGORIES,
          description: "Kind of hike. Do not use Milestone here.",
        },
        elevation: { type: "string", description: "Required elevation, such as 2,954 MASL." },
      },
      required: ["title", "date", "category", "elevation"],
    },
  },
  {
    name: "add_milestone",
    description:
      "Add a milestone to the logbook. Include photos to save its gallery in the same step. When the user attaches image files, send each file as base64 in photos[].data. Public image URLs still work.",
    inputSchema: {
      type: "object",
      properties: storyFields,
      required: ["title", "date"],
    },
  },
]

function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] }
}

function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return ""
  return blocks
    .filter(block => block._type === "block" && Array.isArray(block.children))
    .map(block => block.children.map(child => child.text || "").join(""))
    .join("\n\n")
}

function summarizeExpedition(expedition) {
  return {
    title: expedition.title,
    slug: expedition.slug,
    date: expedition.dateDisplay || expedition.date,
    location: expedition.location || "",
    elevation: expedition.elevation || "",
    category: expedition.category,
    excerpt: expedition.excerpt || "",
    cover: expedition.cover?.src || null,
  }
}

async function callTool(name, args) {
  try {
    return await dispatchTool(name, args)
  } catch (error) {
    return { content: [{ type: "text", text: error.message || "Could not complete that request." }], isError: true }
  }
}

async function dispatchTool(name, args) {
  if (name === "add_hike") return textResult(await createStory({ kind: "hike", ...args }))
  if (name === "add_milestone") return textResult(await createStory({ kind: "milestone", ...args }))
  if (name === "list_hikes") {
    const expeditions = await getExpeditions()
    return textResult(expeditions.filter(item => item.category !== "Milestone").map(summarizeExpedition))
  }
  if (name === "list_milestones") {
    const expeditions = await getExpeditions()
    return textResult(expeditions.filter(item => item.category === "Milestone").map(summarizeExpedition))
  }
  if (name === "list_galleries") {
    const galleries = await getGalleries()
    return textResult(
      galleries.map(gallery => ({
        title: gallery.title,
        date: gallery.date,
        hikeSlug: gallery.relatedSlug,
        cover: gallery.cover?.src || null,
        items: gallery.images.map(item => ({
          type: item.type,
          src: item.src,
          caption: item.caption,
        })),
      }))
    )
  }
  if (name === "get_hike") {
    const slug = String(args?.slug || "").trim()
    if (!slug) {
      return { content: [{ type: "text", text: "A slug is required." }], isError: true }
    }
    const result = await getExpedition(slug)
    if (!result) {
      return { content: [{ type: "text", text: `No hike found for slug "${slug}".` }], isError: true }
    }
    return textResult({
      ...summarizeExpedition(result.expedition),
      story: blocksToText(result.expedition.body),
      photos: result.galleryItems.map(item => ({
        type: item.type,
        src: item.src,
        caption: item.caption,
      })),
    })
  }
  return { content: [{ type: "text", text: `Unknown tool "${name}".` }], isError: true }
}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result }
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } }
}

async function handleMessage(message) {
  if (!message || message.jsonrpc !== "2.0" || !message.method) {
    return rpcError(message?.id ?? null, -32600, "Invalid request")
  }

  const { id, method, params } = message
  const isNotification = id === undefined

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: params?.protocolVersion || PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: MCP_CLIENT_ID, version: "1.0.0" },
    })
  }
  if (method === "ping") return rpcResult(id, {})
  if (method === "tools/list") return rpcResult(id, { tools: TOOLS })
  if (method === "tools/call") {
    const result = await callTool(params?.name, params?.arguments || {})
    return rpcResult(id, result)
  }
  if (method.startsWith("notifications/") || isNotification) return null
  return rpcError(id ?? null, -32601, `Method not found: ${method}`)
}

export async function handleMcpBody(body) {
  if (Array.isArray(body)) {
    const responses = []
    for (const message of body) {
      const response = await handleMessage(message)
      if (response) responses.push(response)
    }
    return responses.length ? responses : null
  }
  return handleMessage(body)
}
