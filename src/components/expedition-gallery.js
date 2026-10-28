"use client"

import * as React from "react"
import Image from "next/image"

const ExpeditionGallery = ({ items, title }) => {
  const [openIndex, setOpenIndex] = React.useState(null)

  const closeLightbox = React.useCallback(() => setOpenIndex(null), [])

  const showPrev = React.useCallback(() => {
    setOpenIndex(index => (index === null ? index : (index - 1 + items.length) % items.length))
  }, [items.length])

  const showNext = React.useCallback(() => {
    setOpenIndex(index => (index === null ? index : (index + 1) % items.length))
  }, [items.length])

  React.useEffect(() => {
    const onKey = event => {
      if (event.key === "Escape") closeLightbox()
      if (event.key === "ArrowLeft") showPrev()
      if (event.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [closeLightbox, showPrev, showNext])

  if (!items.length) return null

  const active = openIndex !== null ? items[openIndex] : null

  return (
    <>
      <div className="container" style={{ paddingBottom: "5rem" }}>
        <span className="eyebrow">From this hike</span>
        <h2 className="display section-title">Gallery</h2>
        <div className="gallery-grid">
          {items.map((item, index) => (
            <button
              key={item.key || index}
              className="gallery-item"
              onClick={() => setOpenIndex(index)}
              aria-label={item.type === "video" ? "Play video" : "View photo"}
            >
              {item.type === "video" ? (
                <video src={item.src} muted playsInline preload="metadata" />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt || title}
                  fill
                  sizes="(max-width: 760px) 100vw, 33vw"
                  style={{ objectFit: "cover", objectPosition: item.position }}
                  placeholder={item.lqip ? "blur" : "empty"}
                  blurDataURL={item.lqip || undefined}
                />
              )}
              {item.type === "video" && (
                <span className="play-icon" aria-hidden="true">
                  ▶
                </span>
              )}
              {item.caption && <span className="caption">{item.caption}</span>}
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button className="close" aria-label="Close" onClick={closeLightbox}>
            ✕
          </button>
          {items.length > 1 && (
            <>
              <button
                className="nav-arrow prev"
                aria-label="Previous"
                onClick={event => {
                  event.stopPropagation()
                  showPrev()
                }}
              >
                ‹
              </button>
              <button
                className="nav-arrow next"
                aria-label="Next"
                onClick={event => {
                  event.stopPropagation()
                  showNext()
                }}
              >
                ›
              </button>
            </>
          )}
          <figure onClick={event => event.stopPropagation()}>
            {active.type === "video" ? (
              <video src={active.src} controls autoPlay />
            ) : (
              <Image
                src={active.src}
                alt={active.alt || title}
                width={active.width || 1600}
                height={active.height || 1066}
                sizes="94vw"
                style={{ objectPosition: active.position }}
                placeholder={active.lqip ? "blur" : "empty"}
                blurDataURL={active.lqip || undefined}
              />
            )}
            {active.caption && (
              <figcaption>
                <span>{active.caption}</span>
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  )
}

export default ExpeditionGallery
