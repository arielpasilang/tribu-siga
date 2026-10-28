import { getExpeditions } from "../src/lib/content"
import { site } from "../src/lib/site"

export default async function sitemap() {
  const expeditions = await getExpeditions()
  const paths = ["/", "/adventures", "/gallery", "/about", "/contact"]

  return [
    ...paths.map(path => ({
      url: new URL(path, site.url).href,
      changeFrequency: "weekly",
      priority: path === "/" ? 1 : 0.7,
    })),
    ...expeditions.map(expedition => ({
      url: new URL(`/adventures/${expedition.slug}`, site.url).href,
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ]
}
