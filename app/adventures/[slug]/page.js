import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import PortableText from "../../../src/components/portable-text"
import ExpeditionGallery from "../../../src/components/expedition-gallery"
import { getExpedition, getExpeditions } from "../../../src/lib/content"
import { site } from "../../../src/lib/site"
import { displayTitle, tidyText } from "../../../src/lib/text"

export const revalidate = 60

export async function generateStaticParams() {
  const expeditions = await getExpeditions()
  return expeditions.map(expedition => ({ slug: expedition.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getExpedition(slug)
  if (!data) return { title: "Hike" }
  const { expedition } = data
  const image = expedition.coverLarge?.src || expedition.cover?.src
  return {
    title: displayTitle(expedition.title),
    description: expedition.excerpt,
    openGraph: {
      type: "article",
      publishedTime: expedition.date,
      images: image ? [{ url: image }] : undefined,
    },
  }
}

export default async function AdventurePage({ params }) {
  const { slug } = await params
  const data = await getExpedition(slug)
  if (!data) notFound()

  const { expedition, previous, next, galleryItems } = data
  const cover = expedition.coverLarge || expedition.cover
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: displayTitle(expedition.title),
    description: expedition.excerpt,
    image: cover?.src,
    datePublished: expedition.date,
    url: `${site.url}/adventures/${expedition.slug}/`,
    publisher: {
      "@type": "Organization",
      name: site.title,
    },
  }

  return (
    <>
      <section className="detail-hero">
        {cover?.src && (
          <div className="hero-bg">
            <Image
              src={cover.src}
              alt={displayTitle(expedition.title)}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: cover.position }}
              placeholder={cover.lqip ? "blur" : "empty"}
              blurDataURL={cover.lqip || undefined}
            />
          </div>
        )}
        <div className="container">
          <span className="chip">{expedition.category}</span>
          <h1 className="display">{displayTitle(expedition.title)}</h1>
        </div>
      </section>

      <div className="container">
        <div className="detail-meta">
          <div className="item">
            <strong>Date</strong>
            {expedition.dateDisplay}
          </div>
          <div className="item">
            <strong>Location</strong>
            {tidyText(expedition.location)}
          </div>
          <div className="item">
            <strong>Elevation</strong>
            {tidyText(expedition.elevation)}
          </div>
        </div>

        <article className="prose">
          <PortableText value={expedition.body} />
        </article>

        <nav className="prevnext">
          {previous ? (
            <Link href={`/adventures/${previous.slug}`} className="prev">
              <span className="dir">← Earlier climb</span>
              <div className="name">{displayTitle(previous.title)}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/adventures/${next.slug}`} className="next">
              <span className="dir">Next climb →</span>
              <div className="name">{displayTitle(next.title)}</div>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      <ExpeditionGallery items={galleryItems} title={displayTitle(expedition.title)} />

      <div className="container" style={{ padding: "3rem 0 5rem" }}>
        <Link href="/adventures" className="btn btn-ghost">
          ← Back to the logbook
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </>
  )
}
