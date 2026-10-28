import Header from "../src/components/header"
import Footer from "../src/components/footer"
import { site, socialLinks } from "../src/lib/site"
import logo from "../src/images/logo.jpg"
import banner from "../src/images/main-banner.jpg"
import "@fontsource-variable/fraunces"
import "@fontsource-variable/outfit"
import "../src/styles/global.css"

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    siteName: site.title,
    type: "website",
    images: [
      {
        url: banner.src,
        width: banner.width,
        height: banner.height,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [banner.src],
  },
}

export const viewport = {
  themeColor: "#e8973a",
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: site.title,
  url: site.url,
  logo: new URL(logo.src, site.url).href,
  sameAs: socialLinks,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  )
}
