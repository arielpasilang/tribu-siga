import { site } from "../src/lib/site"

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/dashboard", "/login"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
