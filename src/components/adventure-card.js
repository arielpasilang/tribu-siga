import Link from "next/link"
import Image from "next/image"
import { displayTitle, tidyText } from "../lib/text"

const AdventureCard = ({ adventure }) => {
  const cover = adventure.cover

  return (
    <article className="adventure-card">
      <div className="cover">
        {cover?.src && (
          <Image
            src={cover.src}
            alt={displayTitle(adventure.title)}
            fill
            sizes="(max-width: 760px) 100vw, 400px"
            style={{ objectFit: "cover", objectPosition: cover.position }}
            placeholder={cover.lqip ? "blur" : "empty"}
            blurDataURL={cover.lqip || undefined}
          />
        )}
      </div>
      <div className="body">
        <div className="meta">
          <span className="chip">{adventure.category}</span>
          <span>{adventure.dateDisplay}</span>
        </div>
        <h3>
          <Link href={`/adventures/${adventure.slug}`}>{displayTitle(adventure.title)}</Link>
        </h3>
        <p className="excerpt">{adventure.excerpt}</p>
        <div className="foot">
          <span>{tidyText(adventure.location)}</span>
          <span>{tidyText(adventure.elevation)}</span>
        </div>
      </div>
    </article>
  )
}

export default AdventureCard
