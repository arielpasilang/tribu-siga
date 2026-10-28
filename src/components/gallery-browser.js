"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { displayTitle } from "../lib/text"

const GalleryBrowser = ({ albums }) => {
  const [openAlbum, setOpenAlbum] = React.useState(null)
  const [photoIndex, setPhotoIndex] = React.useState(0)

  const closeLightbox = React.useCallback(() => setOpenAlbum(null), [])

  const showPrev = React.useCallback(() => {
    setPhotoIndex(index =>
      openAlbum ? (index - 1 + openAlbum.images.length) % openAlbum.images.length : index
    )
  }, [openAlbum])

  const showNext = React.useCallback(() => {
    setPhotoIndex(index => (openAlbum ? (index + 1) % openAlbum.images.length : index))
  }, [openAlbum])

  React.useEffect(() => {
    const onKey = event => {
      if (event.key === "Escape") closeLightbox()
      if (event.key === "ArrowLeft") showPrev()
      if (event.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [closeLightbox, showPrev, showNext])

  const photo = openAlbum ? openAlbum.images[photoIndex] : null

  return (
    <>
      <div className="gallery-grid">
        {albums.map(album => (
          <button
            key={album.id}
            className="gallery-item"
            onClick={() => {
              setOpenAlbum(album)
              setPhotoIndex(0)
            }}
            aria-label={`View gallery: ${displayTitle(album.title)}`}
          >
            <Image
              src={album.cover.src}
              alt={displayTitle(album.title)}
              fill
              sizes="(max-width: 760px) 100vw, 33vw"
              style={{ objectFit: "cover", objectPosition: album.cover.position }}
              placeholder={album.cover.lqip ? "blur" : "empty"}
              blurDataURL={album.cover.lqip || undefined}
            />
            <span className="caption">
              {displayTitle(album.title)} · {album.images.length} item
              {album.images.length === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>

      {openAlbum && photo && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button className="close" aria-label="Close" onClick={closeLightbox}>
            ✕
          </button>
          {openAlbum.images.length > 1 && (
            <>
              <button
                className="nav-arrow prev"
                aria-label="Previous photo"
                onClick={event => {
                  event.stopPropagation()
                  showPrev()
                }}
              >
                ‹
              </button>
              <button
                className="nav-arrow next"
                aria-label="Next photo"
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
            {photo.type === "video" ? (
              <video src={photo.src} controls autoPlay />
            ) : (
              <Image
                src={photo.src}
                alt={photo.alt || displayTitle(openAlbum.title)}
                width={photo.width || 1600}
                height={photo.height || 1066}
                sizes="94vw"
                style={{ objectPosition: photo.position }}
                placeholder={photo.lqip ? "blur" : "empty"}
                blurDataURL={photo.lqip || undefined}
              />
            )}
            <figcaption>
              <span>
                <strong>{displayTitle(openAlbum.title)}</strong>
                {photo.caption ? ` · ${photo.caption}` : ""}
                {openAlbum.images.length > 1 &&
                  ` · ${photoIndex + 1}/${openAlbum.images.length}`}
              </span>
              {openAlbum.relatedSlug && (
                <Link href={`/adventures/${openAlbum.relatedSlug}`}>Read the story →</Link>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}

export default GalleryBrowser
