import * as React from "react"
import { Link, navigate } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { CATEGORIES } from "../../shared/categories"
import { resizeImageToBase64 } from "../utils/resize-image"

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (res.status === 401) {
    navigate("/login/")
    throw new Error("Session expired — please log in again.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Something went wrong")
  return data
}

async function getJson(url) {
  const res = await fetch(url, { credentials: "include" })
  if (res.status === 401) {
    navigate("/login/")
    throw new Error("Session expired — please log in again.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Something went wrong")
  return data
}

// Each image is uploaded in its own small request (rather than bundling
// every photo's base64 into one big create-* call) so payload size and
// per-request time stay well under Netlify Functions' limits no matter
// how many photos a gallery has.
async function uploadImage({ base64, filename }) {
  const data = await postJson("/.netlify/functions/upload-image", { base64, filename })
  return data.assetId
}

const MAX_VIDEO_BYTES = 20 * 1024 * 1024

// Videos go to a separate Edge Function (/api/upload-video), not a
// regular Netlify Function — regular Functions cap requests at ~6MB,
// far too small for video. The file is sent as a raw binary body
// (no base64/JSON) straight through to Sanity.
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
    navigate("/login/")
    throw new Error("Session expired — please log in again.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Video upload failed")
  return data.assetId
}

const ExpeditionForm = ({ onAdded }) => {
  const [fields, setFields] = React.useState({
    title: "",
    date: "",
    dateDisplay: "",
    location: "",
    elevation: "",
    category: CATEGORIES[0],
    excerpt: "",
    body: "",
  })
  const [coverFile, setCoverFile] = React.useState(null)
  const [status, setStatus] = React.useState({ state: "idle" })

  const setField = (name, value) => setFields(f => ({ ...f, [name]: value }))

  const onSubmit = async e => {
    e.preventDefault()
    if (!coverFile) {
      setStatus({ state: "error", message: "Please choose a cover image." })
      return
    }
    setStatus({ state: "submitting" })
    try {
      const cover = await resizeImageToBase64(coverFile)
      const coverAssetId = await uploadImage(cover)
      await postJson("/.netlify/functions/create-expedition", { ...fields, coverAssetId })
      setStatus({ state: "idle" })
      setFields({
        title: "",
        date: "",
        dateDisplay: "",
        location: "",
        elevation: "",
        category: CATEGORIES[0],
        excerpt: "",
        body: "",
      })
      setCoverFile(null)
      e.target.reset()
      onAdded()
    } catch (err) {
      setStatus({ state: "error", message: err.message })
    }
  }

  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="exp-title">Title</label>
        <input
          id="exp-title"
          type="text"
          value={fields.title}
          onChange={e => setField("title", e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="exp-date">Date</label>
        <input
          id="exp-date"
          type="date"
          value={fields.date}
          onChange={e => setField("date", e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="exp-dateDisplay">Date (display)</label>
        <input
          id="exp-dateDisplay"
          type="text"
          placeholder="e.g. March 30 – April 1, 2018"
          value={fields.dateDisplay}
          onChange={e => setField("dateDisplay", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="exp-location">Location</label>
        <input
          id="exp-location"
          type="text"
          value={fields.location}
          onChange={e => setField("location", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="exp-elevation">Elevation</label>
        <input
          id="exp-elevation"
          type="text"
          value={fields.elevation}
          onChange={e => setField("elevation", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="exp-category">Category</label>
        <select
          id="exp-category"
          value={fields.category}
          onChange={e => setField("category", e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="exp-excerpt">Excerpt</label>
        <textarea
          id="exp-excerpt"
          value={fields.excerpt}
          onChange={e => setField("excerpt", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="exp-body">Body</label>
        <textarea
          id="exp-body"
          rows={10}
          placeholder="Separate paragraphs with a blank line."
          value={fields.body}
          onChange={e => setField("body", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="exp-cover">Cover image</label>
        <input
          id="exp-cover"
          type="file"
          accept="image/*"
          onChange={e => setCoverFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      {status.state === "error" && <p className="form-error">{status.message}</p>}

      <button className="btn btn-primary" type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Adding…" : "Add hike"}
      </button>
    </form>
  )
}

const emptyImageRow = () => ({ key: Math.random().toString(36).slice(2), file: null, caption: "" })

const GalleryForm = ({ expeditions, onAdded }) => {
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState("")
  const [coverFile, setCoverFile] = React.useState(null)
  const [relatedExpeditionId, setRelatedExpeditionId] = React.useState("")
  const [imageRows, setImageRows] = React.useState([emptyImageRow(), emptyImageRow(), emptyImageRow()])
  const [status, setStatus] = React.useState({ state: "idle" })

  const updateRow = (key, patch) =>
    setImageRows(rows => rows.map(r => (r.key === key ? { ...r, ...patch } : r)))

  const onSubmit = async e => {
    e.preventDefault()
    const usableRows = imageRows.filter(r => r.file)
    if (!coverFile) {
      setStatus({ state: "error", message: "Please choose a cover image." })
      return
    }
    if (usableRows.length === 0) {
      setStatus({ state: "error", message: "Add at least one photo or video." })
      return
    }
    setStatus({ state: "submitting" })
    try {
      const [coverAssetId, images] = await Promise.all([
        resizeImageToBase64(coverFile).then(uploadImage),
        Promise.all(
          usableRows.map(async row => {
            if (row.file.type.startsWith("video/")) {
              const assetId = await uploadVideo(row.file)
              return { assetId, caption: row.caption, type: "video" }
            }
            const resized = await resizeImageToBase64(row.file)
            const assetId = await uploadImage(resized)
            return { assetId, caption: row.caption, type: "image" }
          })
        ),
      ])
      await postJson("/.netlify/functions/create-gallery", {
        title,
        date,
        coverAssetId,
        images,
        relatedExpeditionId: relatedExpeditionId || null,
      })
      setStatus({ state: "idle" })
      setTitle("")
      setDate("")
      setCoverFile(null)
      setRelatedExpeditionId("")
      setImageRows([emptyImageRow(), emptyImageRow(), emptyImageRow()])
      e.target.reset()
      onAdded()
    } catch (err) {
      setStatus({ state: "error", message: err.message })
    }
  }

  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="gal-title">Title</label>
        <input
          id="gal-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="gal-date">Date</label>
        <input id="gal-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="gal-related">Related hike (optional)</label>
        <select
          id="gal-related"
          value={relatedExpeditionId}
          onChange={e => setRelatedExpeditionId(e.target.value)}
        >
          <option value="">None</option>
          {expeditions.map(exp => (
            <option key={exp._id} value={exp._id}>
              {exp.title}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="gal-cover">Cover image</label>
        <input
          id="gal-cover"
          type="file"
          accept="image/*"
          onChange={e => setCoverFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <p className="eyebrow">Photos & videos</p>
      {imageRows.map((row, i) => (
        <div className="gallery-image-row" key={row.key}>
          <div className="field">
            <label htmlFor={`gal-img-${row.key}`}>
              Photo/video {i + 1}
              {row.file?.type.startsWith("video/") && " (video, 20MB max)"}
            </label>
            <input
              id={`gal-img-${row.key}`}
              type="file"
              accept="image/*,video/*"
              onChange={e => updateRow(row.key, { file: e.target.files?.[0] || null })}
            />
          </div>
          <div className="field">
            <label htmlFor={`gal-caption-${row.key}`}>Caption</label>
            <input
              id={`gal-caption-${row.key}`}
              type="text"
              value={row.caption}
              onChange={e => updateRow(row.key, { caption: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setImageRows(rows => [...rows, emptyImageRow()])}
      >
        + Add another photo or video
      </button>

      {status.state === "error" && <p className="form-error">{status.message}</p>}

      <button className="btn btn-primary" type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Adding…" : "Add gallery"}
      </button>
    </form>
  )
}

const ExpeditionTable = ({ expeditions, onDelete, deletingId }) => {
  if (expeditions.length === 0) return <p>No hikes yet.</p>
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {expeditions.map(exp => (
          <tr key={exp._id}>
            <td>{exp.title}</td>
            <td>{exp.dateDisplay}</td>
            <td>{exp.category}</td>
            <td className="actions">
              <Link to={`/adventures/${exp.slug}/`} target="_blank" rel="noreferrer">
                View
              </Link>
              <button
                className="link-danger"
                onClick={() => onDelete(exp._id, exp.title)}
                disabled={deletingId === exp._id}
              >
                {deletingId === exp._id ? "Deleting…" : "Delete"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const GalleryTable = ({ galleries, onDelete, deletingId }) => {
  if (galleries.length === 0) return <p>No galleries yet.</p>
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Items</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {galleries.map(gal => (
          <tr key={gal._id}>
            <td>{gal.title}</td>
            <td>{gal.date}</td>
            <td>{gal.itemCount}</td>
            <td className="actions">
              <Link to="/gallery/" target="_blank" rel="noreferrer">
                View
              </Link>
              <button
                className="link-danger"
                onClick={() => onDelete(gal._id, gal.title)}
                disabled={deletingId === gal._id}
              >
                {deletingId === gal._id ? "Deleting…" : "Delete"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const DashboardPage = () => {
  const [tab, setTab] = React.useState("expedition")
  const [content, setContent] = React.useState({ expeditions: [], galleries: [] })
  const [loading, setLoading] = React.useState(true)
  const [showAddExpedition, setShowAddExpedition] = React.useState(false)
  const [showAddGallery, setShowAddGallery] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState(null)
  const [listError, setListError] = React.useState(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getJson("/.netlify/functions/list-content")
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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    setDeletingId(id)
    try {
      await postJson("/.netlify/functions/delete-document", { id })
      await refresh()
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const logout = async () => {
    await fetch("/.netlify/functions/logout", { method: "POST", credentials: "include" })
    navigate("/login/")
  }

  return (
    <Layout>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Tribe only</span>
          <h1 className="display">Dashboard</h1>
          <p className="lead">Manage hikes, milestones, and galleries.</p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <div className="dashboard-tabs">
          <button
            className={tab === "expedition" ? "btn btn-primary" : "btn btn-ghost"}
            onClick={() => setTab("expedition")}
          >
            Hikes & Milestone
          </button>
          <button
            className={tab === "gallery" ? "btn btn-primary" : "btn btn-ghost"}
            onClick={() => setTab("gallery")}
          >
            Gallery
          </button>
          <button className="btn btn-ghost" onClick={logout} style={{ marginLeft: "auto" }}>
            Log out
          </button>
        </div>

        {listError && <p className="form-error">{listError}</p>}

        {tab === "expedition" ? (
          <>
            <div className="dashboard-toolbar">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddExpedition(s => !s)}
              >
                {showAddExpedition ? "Cancel" : "+ Add hike"}
              </button>
            </div>
            {showAddExpedition && (
              <div style={{ marginBottom: "2.5rem" }}>
                <ExpeditionForm
                  onAdded={() => {
                    setShowAddExpedition(false)
                    refresh()
                  }}
                />
              </div>
            )}
            {loading ? (
              <p>Loading…</p>
            ) : (
              <ExpeditionTable
                expeditions={content.expeditions}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            )}
          </>
        ) : (
          <>
            <div className="dashboard-toolbar">
              <button className="btn btn-primary" onClick={() => setShowAddGallery(s => !s)}>
                {showAddGallery ? "Cancel" : "+ Add gallery"}
              </button>
            </div>
            {showAddGallery && (
              <div style={{ marginBottom: "2.5rem" }}>
                <GalleryForm
                  expeditions={content.expeditions}
                  onAdded={() => {
                    setShowAddGallery(false)
                    refresh()
                  }}
                />
              </div>
            )}
            {loading ? (
              <p>Loading…</p>
            ) : (
              <GalleryTable
                galleries={content.galleries}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            )}
          </>
        )}
      </section>
    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo title="Dashboard" pathname={location.pathname} noindex />
)

export default DashboardPage
