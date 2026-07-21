import * as React from "react"
import { graphql, navigate } from "gatsby"
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

const ExpeditionForm = () => {
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
      await postJson("/.netlify/functions/create-expedition", { ...fields, cover })
      setStatus({ state: "success", message: `"${fields.title}" was added.` })
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
      {status.state === "success" && <p className="form-success">{status.message}</p>}

      <button className="btn btn-primary" type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Adding…" : "Add expedition"}
      </button>
    </form>
  )
}

const emptyImageRow = () => ({ key: Math.random().toString(36).slice(2), file: null, caption: "" })

const GalleryForm = ({ expeditions }) => {
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
      setStatus({ state: "error", message: "Add at least one photo." })
      return
    }
    setStatus({ state: "submitting" })
    try {
      const cover = await resizeImageToBase64(coverFile)
      const images = await Promise.all(
        usableRows.map(async row => {
          const resized = await resizeImageToBase64(row.file)
          return { ...resized, caption: row.caption }
        })
      )
      await postJson("/.netlify/functions/create-gallery", {
        title,
        date,
        cover,
        images,
        relatedExpeditionId: relatedExpeditionId || null,
      })
      setStatus({ state: "success", message: `"${title}" was added.` })
      setTitle("")
      setDate("")
      setCoverFile(null)
      setRelatedExpeditionId("")
      setImageRows([emptyImageRow(), emptyImageRow(), emptyImageRow()])
      e.target.reset()
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
        <label htmlFor="gal-related">Related expedition (optional)</label>
        <select
          id="gal-related"
          value={relatedExpeditionId}
          onChange={e => setRelatedExpeditionId(e.target.value)}
        >
          <option value="">None</option>
          {expeditions.map(exp => (
            <option key={exp.id} value={exp.id}>
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

      <p className="eyebrow">Photos</p>
      {imageRows.map((row, i) => (
        <div className="gallery-image-row" key={row.key}>
          <div className="field">
            <label htmlFor={`gal-img-${row.key}`}>Photo {i + 1}</label>
            <input
              id={`gal-img-${row.key}`}
              type="file"
              accept="image/*"
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
        + Add another photo
      </button>

      {status.state === "error" && <p className="form-error">{status.message}</p>}
      {status.state === "success" && <p className="form-success">{status.message}</p>}

      <button className="btn btn-primary" type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Adding…" : "Add gallery"}
      </button>
    </form>
  )
}

const DashboardPage = ({ data }) => {
  const [tab, setTab] = React.useState("expedition")
  const expeditions = data.allSanityExpedition.nodes

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
          <p className="lead">Add a new expedition or gallery straight from the site.</p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <div className="dashboard-tabs">
          <button
            className={tab === "expedition" ? "btn btn-primary" : "btn btn-ghost"}
            onClick={() => setTab("expedition")}
          >
            Add Expedition
          </button>
          <button
            className={tab === "gallery" ? "btn btn-primary" : "btn btn-ghost"}
            onClick={() => setTab("gallery")}
          >
            Add Gallery
          </button>
          <button className="btn btn-ghost" onClick={logout} style={{ marginLeft: "auto" }}>
            Log out
          </button>
        </div>

        {tab === "expedition" ? <ExpeditionForm /> : <GalleryForm expeditions={expeditions} />}
      </section>
    </Layout>
  )
}

export const query = graphql`
  query {
    allSanityExpedition(sort: { date: DESC }) {
      nodes {
        id
        title
      }
    }
  }
`

export const Head = () => <Seo title="Dashboard" />

export default DashboardPage
