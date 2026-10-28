"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CATEGORIES } from "../lib/categories"
import { displayTitle } from "../lib/text"
import { resizeImageToBase64 } from "../utils/resize-image"
import McpPanel from "./mcp-panel"

const HIKE_CATEGORIES = CATEGORIES.filter(category => category !== "Milestone")

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (res.status === 401) {
    window.location.href = "/login"
    throw new Error("Session expired — please log in again.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Something went wrong")
  return data
}

async function getJson(url) {
  const res = await fetch(url, { credentials: "include" })
  if (res.status === 401) {
    window.location.href = "/login"
    throw new Error("Session expired — please log in again.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Something went wrong")
  return data
}

async function uploadImage(file) {
  const resized = await resizeImageToBase64(file)
  const data = await postJson("/api/upload-image", resized)
  return data.assetId
}

const MAX_VIDEO_BYTES = 20 * 1024 * 1024

async function uploadVideo(file) {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`"${file.name}" is over the 20MB video limit.`)
  }
  const res = await fetch("/api/upload-video", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": file.type || "video/mp4",
      "X-Filename": file.name,
    },
    body: file,
  })
  if (res.status === 401) {
    window.location.href = "/login"
    throw new Error("Session expired — please log in again.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Video upload failed")
  return data.assetId
}

function formatLongDate(iso) {
  if (!iso) return ""
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return ""
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function newKey() {
  return Math.random().toString(36).slice(2)
}

function useMediaItems() {
  const [items, setItems] = React.useState([])
  const itemsRef = React.useRef(items)
  itemsRef.current = items

  React.useEffect(() => {
    return () => {
      itemsRef.current.forEach(item => {
        if (item.preview) URL.revokeObjectURL(item.preview)
      })
    }
  }, [])

  const addFiles = fileList => {
    const next = Array.from(fileList || []).map(file => ({
      key: newKey(),
      file,
      caption: "",
      preview: file.type.startsWith("video/") ? "" : URL.createObjectURL(file),
    }))
    setItems(current => [...current, ...next])
  }

  const removeItem = key => {
    setItems(current => {
      const item = current.find(entry => entry.key === key)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return current.filter(entry => entry.key !== key)
    })
  }

  const setCaption = (key, caption) => {
    setItems(current => current.map(entry => (entry.key === key ? { ...entry, caption } : entry)))
  }

  return { items, addFiles, removeItem, setCaption }
}

async function uploadMediaItems(items, setStatus) {
  const uploaded = []
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    setStatus({
      state: "submitting",
      message: `Uploading ${index + 1} of ${items.length}…`,
    })
    const isVideo = item.file.type.startsWith("video/")
    const assetId = isVideo ? await uploadVideo(item.file) : await uploadImage(item.file)
    uploaded.push({
      assetId,
      caption: item.caption,
      type: isVideo ? "video" : "image",
    })
  }
  return uploaded
}

const MediaFields = ({ inputId, label, hint, items, onAdd, onRemove, onCaption }) => (
  <>
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={event => {
          onAdd(event.target.files)
          event.target.value = ""
        }}
      />
      {hint && <p className="hint">{hint}</p>}
    </div>

    {items.length > 0 && (
      <ul className="upload-list">
        {items.map((item, index) => (
          <li key={item.key}>
            {item.preview ? <img src={item.preview} alt="" /> : <span className="video-mark">Video</span>}
            <div className="field">
              <label htmlFor={`caption-${item.key}`}>
                {item.file.type.startsWith("video/") ? "Video" : "Photo"} {index + 1} caption
              </label>
              <input
                id={`caption-${item.key}`}
                type="text"
                value={item.caption}
                placeholder="Optional"
                onChange={event => onCaption(item.key, event.target.value)}
              />
            </div>
            <button type="button" className="link-danger" onClick={() => onRemove(item.key)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    )}
  </>
)

const StoryForm = ({ mode, onDone, onCancel }) => {
  const isMilestone = mode === "milestone"
  const [fields, setFields] = React.useState({
    title: "",
    date: "",
    location: "",
    elevation: "",
    category: isMilestone ? "Milestone" : HIKE_CATEGORIES[0],
    excerpt: "",
    body: "",
  })
  const [customDate, setCustomDate] = React.useState(false)
  const [dateLabel, setDateLabel] = React.useState("")
  const [coverFile, setCoverFile] = React.useState(null)
  const [coverPreview, setCoverPreview] = React.useState("")
  const photos = useMediaItems()
  const [status, setStatus] = React.useState({ state: "idle" })

  React.useEffect(() => {
    if (!coverFile) {
      setCoverPreview("")
      return undefined
    }
    const url = URL.createObjectURL(coverFile)
    setCoverPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [coverFile])

  const setField = (name, value) => setFields(current => ({ ...current, [name]: value }))

  const onSubmit = async event => {
    event.preventDefault()
    if (!coverFile) {
      setStatus({ state: "error", message: "Choose a cover photo." })
      return
    }
    setStatus({ state: "submitting", message: "Uploading the cover…" })
    try {
      const coverAssetId = await uploadImage(coverFile)
      setStatus({ state: "submitting", message: isMilestone ? "Saving…" : "Saving the hike…" })
      const created = await postJson("/api/create-expedition", {
        ...fields,
        dateDisplay: customDate ? dateLabel : formatLongDate(fields.date),
        coverAssetId,
      })
      const label = isMilestone ? "Milestone" : "Hike"
      if (photos.items.length > 0) {
        try {
          const uploaded = await uploadMediaItems(photos.items, setStatus)
          setStatus({ state: "submitting", message: "Saving the photos…" })
          await postJson("/api/create-gallery", {
            title: fields.title,
            date: fields.date,
            coverAssetId,
            images: uploaded,
            relatedExpeditionId: created.id,
          })
        } catch (err) {
          onDone({
            section: isMilestone ? "milestones" : "hikes",
            message: `${label} added, but the photos did not upload. ${err.message}`,
            href: `/adventures/${created.slug}`,
          })
          return
        }
      }
      onDone({
        section: isMilestone ? "milestones" : "hikes",
        message: photos.items.length > 0 ? `${label} added, with photos.` : `${label} added.`,
        href: `/adventures/${created.slug}`,
      })
    } catch (err) {
      setStatus({ state: "error", message: err.message })
    }
  }

  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      <div className="composer-head">
        <div>
          <h2>{isMilestone ? "Add a milestone" : "Add a hike"}</h2>
          <p>
            {isMilestone
              ? "An anniversary, a first, or any moment that belongs in the logbook. Add the photos in the same save."
              : "A climb, training day, or overnight. Add the story and the photos together, then save once."}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="field">
        <label htmlFor="story-title">Title</label>
        <input
          id="story-title"
          type="text"
          value={fields.title}
          placeholder={isMilestone ? "First anniversary" : "Mt. Apo Day Hike"}
          onChange={event => setField("title", event.target.value)}
          required
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="story-date">Date</label>
          <input
            id="story-date"
            type="date"
            value={fields.date}
            onChange={event => setField("date", event.target.value)}
            required
          />
          {fields.date && !customDate && <p className="hint">Shown as {formatLongDate(fields.date)}</p>}
        </div>
        {isMilestone ? (
          <div className="field">
            <label htmlFor="story-location">Place</label>
            <input
              id="story-location"
              type="text"
              value={fields.location}
              placeholder="Cebu"
              onChange={event => setField("location", event.target.value)}
            />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="story-category">Kind of hike</label>
            <select
              id="story-category"
              value={fields.category}
              onChange={event => setField("category", event.target.value)}
            >
              {HIKE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={customDate}
          onChange={event => setCustomDate(event.target.checked)}
        />
        This covers more than one day
      </label>
      {customDate && (
        <div className="field">
          <label htmlFor="story-date-label">Date label</label>
          <input
            id="story-date-label"
            type="text"
            placeholder="March 30 – April 1, 2018"
            value={dateLabel}
            onChange={event => setDateLabel(event.target.value)}
            required
          />
        </div>
      )}

      {!isMilestone && (
        <div className="field-row">
          <div className="field">
            <label htmlFor="story-location">Location</label>
            <input
              id="story-location"
              type="text"
              value={fields.location}
              placeholder="Davao, Mindanao"
              onChange={event => setField("location", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="story-elevation">Elevation</label>
            <input
              id="story-elevation"
              type="text"
              value={fields.elevation}
              placeholder="2,954 MASL"
              onChange={event => setField("elevation", event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="story-excerpt">Short summary</label>
        <textarea
          id="story-excerpt"
          rows={3}
          value={fields.excerpt}
          placeholder="One or two sentences for the logbook card."
          onChange={event => setField("excerpt", event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="story-body">The story</label>
        <textarea
          id="story-body"
          rows={8}
          value={fields.body}
          placeholder="Write the story. A blank line starts a new paragraph."
          onChange={event => setField("body", event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="story-cover">Cover photo</label>
        <input
          id="story-cover"
          type="file"
          accept="image/*"
          onChange={event => setCoverFile(event.target.files?.[0] || null)}
          required
        />
        {coverPreview && <img className="cover-preview" src={coverPreview} alt="" />}
      </div>

      <div className="composer-section">
        <div>
          <h3>Photos</h3>
          <p className="hint">
            Optional. These are saved with the {isMilestone ? "milestone" : "hike"} and show on its page.
          </p>
        </div>
        <MediaFields
          inputId="story-photos"
          label="Photos and videos"
          hint="You can select several at once. Videos are limited to 20MB."
          items={photos.items}
          onAdd={photos.addFiles}
          onRemove={photos.removeItem}
          onCaption={photos.setCaption}
        />
      </div>

      {status.state === "error" && <p className="form-error">{status.message}</p>}
      {status.state === "submitting" && <p className="hint">{status.message}</p>}

      <button className="btn btn-primary" type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Saving…" : isMilestone ? "Save milestone" : "Save hike"}
      </button>
    </form>
  )
}

const GalleryForm = ({ expeditions, onDone, onCancel }) => {
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState("")
  const [relatedExpeditionId, setRelatedExpeditionId] = React.useState("")
  const photos = useMediaItems()
  const [coverFile, setCoverFile] = React.useState(null)
  const [status, setStatus] = React.useState({ state: "idle" })

  const onSubmit = async event => {
    event.preventDefault()
    if (photos.items.length === 0) {
      setStatus({ state: "error", message: "Add at least one photo or video." })
      return
    }
    setStatus({ state: "submitting", message: "Uploading…" })
    try {
      const uploaded = await uploadMediaItems(photos.items, setStatus)

      let coverAssetId = null
      if (coverFile) {
        setStatus({ state: "submitting", message: "Uploading the cover…" })
        coverAssetId = await uploadImage(coverFile)
      } else {
        coverAssetId = uploaded.find(item => item.type === "image")?.assetId || null
      }
      if (!coverAssetId) {
        throw new Error("Videos need a separate cover photo.")
      }

      setStatus({ state: "submitting", message: "Saving the album…" })
      await postJson("/api/create-gallery", {
        title,
        date,
        coverAssetId,
        images: uploaded,
        relatedExpeditionId: relatedExpeditionId || null,
      })
      onDone({
        section: "galleries",
        message: "Gallery added.",
        href: "/gallery",
      })
    } catch (err) {
      setStatus({ state: "error", message: err.message })
    }
  }

  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      <div className="composer-head">
        <div>
          <h2>Add a gallery</h2>
          <p>Drop in the photos and videos from one trip. The first photo becomes the cover.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="gal-title">Title</label>
          <input id="gal-title" type="text" value={title} onChange={event => setTitle(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="gal-date">Date</label>
          <input id="gal-date" type="date" value={date} onChange={event => setDate(event.target.value)} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="gal-related">Link to a hike or milestone</label>
        <select
          id="gal-related"
          value={relatedExpeditionId}
          onChange={event => setRelatedExpeditionId(event.target.value)}
        >
          <option value="">None</option>
          {expeditions.map(expedition => (
            <option key={expedition._id} value={expedition._id}>
              {displayTitle(expedition.title)}
              {expedition.category === "Milestone" ? " · Milestone" : ""}
            </option>
          ))}
        </select>
      </div>

      <MediaFields
        inputId="gal-files"
        label="Photos and videos"
        hint="You can select several at once. Videos are limited to 20MB."
        items={photos.items}
        onAdd={photos.addFiles}
        onRemove={photos.removeItem}
        onCaption={photos.setCaption}
      />

      <div className="field">
        <label htmlFor="gal-cover">Different cover photo</label>
        <input
          id="gal-cover"
          type="file"
          accept="image/*"
          onChange={event => setCoverFile(event.target.files?.[0] || null)}
        />
        <p className="hint">Leave this empty to use the first photo. Required if the album is only video.</p>
      </div>

      {status.state === "error" && <p className="form-error">{status.message}</p>}
      {status.state === "submitting" && <p className="hint">{status.message}</p>}

      <button className="btn btn-primary" type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Saving…" : "Save gallery"}
      </button>
    </form>
  )
}

const ContentTable = ({ rows, empty, onDelete, deletingId }) => {
  if (rows.length === 0) return <p className="empty-note">{empty}</p>
  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>{row.title}</td>
              <td>{row.date}</td>
              <td>{row.detail}</td>
              <td className="actions">
                <Link href={row.href} target="_blank" rel="noreferrer">
                  View
                </Link>
                <button
                  type="button"
                  className="link-danger"
                  onClick={() => onDelete(row.id, row.title)}
                  disabled={deletingId === row.id}
                >
                  {deletingId === row.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Dashboard = () => {
  const router = useRouter()
  const composerRef = React.useRef(null)
  const [section, setSection] = React.useState("hikes")
  const [view, setView] = React.useState("dashboard")
  const [composer, setComposer] = React.useState(null)
  const [content, setContent] = React.useState({ expeditions: [], galleries: [] })
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [deletingId, setDeletingId] = React.useState(null)
  const [listError, setListError] = React.useState(null)
  const [notice, setNotice] = React.useState(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getJson("/api/list-content")
      setContent(data)
      setListError(null)
    } catch (err) {
      setListError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  React.useEffect(() => {
    if (composer && composerRef.current) {
      composerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [composer])

  const openComposer = next => {
    setNotice(null)
    setComposer(current => (current === next ? null : next))
    if (next === "milestone") setSection("milestones")
    if (next === "gallery") setSection("galleries")
    if (next === "hike") setSection("hikes")
  }

  const handleDone = async result => {
    setComposer(null)
    setSection(result.section)
    setNotice(result)
    await refresh()
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    setDeletingId(id)
    try {
      await postJson("/api/delete-document", { id })
      await refresh()
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" })
    router.push("/login")
    router.refresh()
  }

  const needle = query.trim().toLowerCase()
  const hikes = content.expeditions.filter(item => item.category !== "Milestone")
  const milestones = content.expeditions.filter(item => item.category === "Milestone")
  const matches = value => !needle || displayTitle(value).toLowerCase().includes(needle)

  const rows =
    section === "galleries"
      ? content.galleries
          .filter(item => matches(item.title))
          .map(item => ({
            id: item._id,
            title: displayTitle(item.title),
            date: item.date,
            detail: `${item.itemCount} item${item.itemCount === 1 ? "" : "s"}`,
            href: "/gallery",
          }))
      : (section === "milestones" ? milestones : hikes)
          .filter(item => matches(item.title))
          .map(item => ({
            id: item._id,
            title: displayTitle(item.title),
            date: item.dateDisplay,
            detail: item.category,
            href: `/adventures/${item.slug}`,
          }))

  const sectionLabel = section === "galleries" ? "Galleries" : section === "milestones" ? "Milestones" : "Hikes"

  return (
    <>
      <section className="page-hero compact">
        <div className="container">
          <div className="dash-hero">
            <div>
              <span className="eyebrow">Tribe only</span>
              <h1 className="display">{view === "mcp" ? "MCP" : "Dashboard"}</h1>
              <p className="lead">
                {view === "mcp"
                  ? "Connect Claude from this site. Log in, approve the connection, and you are sent back."
                  : "Add a hike, a milestone, or a gallery. Pick one to start."}
              </p>
            </div>
            <div className="dash-hero-actions">
              <Link href="/" className="btn btn-ghost" target="_blank" rel="noreferrer">
                View the site
              </Link>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container dash-page">
        <div className="dash-shell">
          <nav className="dash-sidebar" aria-label="Dashboard sections">
            <button
              type="button"
              className={view === "dashboard" ? "active" : ""}
              aria-current={view === "dashboard" ? "page" : undefined}
              onClick={() => setView("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={view === "mcp" ? "active" : ""}
              aria-current={view === "mcp" ? "page" : undefined}
              onClick={() => setView("mcp")}
            >
              MCP
            </button>
          </nav>

          <div className="dash-main">
            {view === "mcp" ? (
              <McpPanel />
            ) : (
              <>
                <div className="dash-create">
                  <button
                    type="button"
                    className={composer === "hike" ? "active" : ""}
                    onClick={() => openComposer("hike")}
                  >
                    <strong>Add a hike</strong>
                    <span>A climb, training day, or overnight</span>
                  </button>
                  <button
                    type="button"
                    className={composer === "milestone" ? "active" : ""}
                    onClick={() => openComposer("milestone")}
                  >
                    <strong>Add a milestone</strong>
                    <span>An anniversary or a tribe moment</span>
                  </button>
                  <button
                    type="button"
                    className={composer === "gallery" ? "active" : ""}
                    onClick={() => openComposer("gallery")}
                  >
                    <strong>Add a gallery</strong>
                    <span>Photos and videos from a trip</span>
                  </button>
                </div>

                {notice && (
                  <p className="form-success dash-notice">
                    {notice.message}{" "}
                    <Link href={notice.href} target="_blank" rel="noreferrer">
                      View it →
                    </Link>
                  </p>
                )}

                {composer && (
                  <div className="composer" ref={composerRef}>
                    {composer === "gallery" ? (
                      <GalleryForm
                        expeditions={content.expeditions}
                        onCancel={() => setComposer(null)}
                        onDone={handleDone}
                      />
                    ) : (
                      <StoryForm mode={composer} onCancel={() => setComposer(null)} onDone={handleDone} />
                    )}
                  </div>
                )}

                <div className="dash-list-head">
                  <div className="dashboard-tabs" role="tablist" aria-label="Saved content">
                    {[
                      ["hikes", "Hikes", hikes.length],
                      ["milestones", "Milestones", milestones.length],
                      ["galleries", "Galleries", content.galleries.length],
                    ].map(([id, label, count]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={section === id}
                        className={section === id ? "btn btn-primary" : "btn btn-ghost"}
                        onClick={() => setSection(id)}
                      >
                        {label} · {count}
                      </button>
                    ))}
                  </div>
                  <div className="field dash-search">
                    <label htmlFor="dash-search" className="sr-only">
                      Search {sectionLabel.toLowerCase()}
                    </label>
                    <input
                      id="dash-search"
                      type="search"
                      placeholder={`Search ${sectionLabel.toLowerCase()}`}
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                    />
                  </div>
                </div>

                {listError && <p className="form-error">{listError}</p>}
                {loading ? (
                  <p>Loading…</p>
                ) : (
                  <ContentTable
                    rows={rows}
                    empty={
                      needle
                        ? `No ${sectionLabel.toLowerCase()} match “${query.trim()}”.`
                        : `No ${sectionLabel.toLowerCase()} yet.`
                    }
                    onDelete={handleDelete}
                    deletingId={deletingId}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Dashboard
