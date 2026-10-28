"use client"

import * as React from "react"
import { site } from "../lib/site"

const CLIENT_ID = "tribu-siga"
const LIVE_SERVER = `${site.url}/api/mcp/`

const TOOLS = [
  ["list_hikes", "Climbs, training days, and overnights. Milestones are left out."],
  ["list_milestones", "Anniversaries and other tribe moments."],
  ["get_hike", "One hike or milestone by its URL slug, including the story and photo captions."],
  ["list_galleries", "Photo albums, and the hike each album belongs to."],
  ["add_hike", "Add a hike. Date and elevation are required. Drop image files in chat, or pass public image URLs, to save its gallery."],
  ["add_milestone", "Add a milestone, with an optional gallery of dropped image files or public image URLs."],
]

async function readJson(res) {
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    window.location.href = "/login/"
    throw new Error("Session expired — please log in again.")
  }
  if (!res.ok) throw new Error(data.error || "Something went wrong")
  return data
}

function formatExpiry(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

const McpPanel = () => {
  const [status, setStatus] = React.useState(null)
  const [token, setToken] = React.useState(null)
  const [expiresAt, setExpiresAt] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [copied, setCopied] = React.useState("")
  const [serverUrl, setServerUrl] = React.useState("")

  React.useEffect(() => {
    setServerUrl(`${window.location.origin}/api/mcp/`)
    let cancelled = false
    fetch("/api/mcp-token", { credentials: "include" })
      .then(readJson)
      .then(data => {
        if (!cancelled) setStatus(data)
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied(current => (current === key ? "" : current)), 1500)
    } catch {
      setError("Could not copy. Select the value and copy it manually.")
    }
  }

  const generate = async () => {
    if (status?.expiresAt && !window.confirm("Generate a new MCP token? The current pasted token will stop working.")) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/mcp-token", { method: "POST", credentials: "include" })
      const data = await readJson(res)
      setToken(data.token)
      setExpiresAt(data.expiresAt)
      setStatus(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const revoke = async () => {
    if (!window.confirm("Revoke the current MCP token? Connected clients will stop working.")) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/mcp-token", { method: "DELETE", credentials: "include" })
      const data = await readJson(res)
      setToken(null)
      setExpiresAt(null)
      setStatus(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mcp-panel">
      <div className="mcp-fields">
        <div className="field">
          <label htmlFor="mcp-client-id">Client ID</label>
          <div className="mcp-copy-row">
            <input id="mcp-client-id" readOnly value={CLIENT_ID} />
            <button type="button" className="btn btn-ghost" onClick={() => copy(CLIENT_ID, "client")}>
              {copied === "client" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="mcp-server-url">Server URL</label>
          <div className="mcp-copy-row">
            <input id="mcp-server-url" readOnly value={serverUrl} />
            <button type="button" className="btn btn-ghost" onClick={() => copy(serverUrl, "url")} disabled={!serverUrl}>
              {copied === "url" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {token ? (
        <div className="field">
          <label htmlFor="mcp-token">MCP token</label>
          <p className="hint">Copy this token now. It will not be shown again.</p>
          <div className="mcp-copy-row">
            <input id="mcp-token" readOnly value={token} />
            <button type="button" className="btn btn-ghost" onClick={() => copy(token, "token")}>
              {copied === "token" ? "Copied" : "Copy"}
            </button>
          </div>
          {expiresAt && <p className="hint">Expires {formatExpiry(expiresAt)}. Send it as a Bearer token.</p>}
          <button type="button" className="btn btn-primary" onClick={() => setToken(null)}>
            Done
          </button>
        </div>
      ) : (
        <div className="mcp-actions">
          <button type="button" className="btn btn-primary" onClick={generate} disabled={busy || !status}>
            {busy ? "Working…" : "Generate MCP token"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={revoke} disabled={busy || !status?.active}>
            Revoke token
          </button>
          <p className="hint">
            {status?.active
              ? status.expiresAt
                ? `A pasted token is active until ${formatExpiry(status.expiresAt)}. Generating a new one replaces it. Revoke also disconnects approved apps.`
                : "An approved connection is active. Revoke disconnects it."
              : "No connection is active. The client ID is tribu-siga."}
          </p>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <McpNotes serverUrl={serverUrl} onCopy={copy} copied={copied} />
    </section>
  )
}

const McpNotes = ({ serverUrl, onCopy, copied }) => {
  const url = serverUrl || LIVE_SERVER
  const claudeConfig = `{
  "mcpServers": {
    "tribu-siga": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${url}",
        "--header",
        "Authorization:\${TRIBU_SIGA_AUTH}"
      ],
      "env": {
        "TRIBU_SIGA_AUTH": "Bearer YOUR_TOKEN"
      }
    }
  }
}`

  return (
    <div className="mcp-notes">
      <h3>How to connect</h3>
      <ol>
        <li>
          In Claude, open <strong>Customize</strong>, then <strong>Connectors</strong>, then <strong>Add custom connector</strong>.
        </li>
        <li>
          Name it Tribu Siga and paste <code>{LIVE_SERVER}</code>
          {url !== LIVE_SERVER ? (
            <>
              . Use <code>{url}</code> only while testing on this machine
            </>
          ) : null}
          . If it asks for an OAuth client ID, enter <code>{CLIENT_ID}</code>.
        </li>
        <li>Claude opens this site. Log in, then choose <strong>Approve connection</strong>. You are sent back to Claude.</li>
        <li>Ask “List the Tribu Siga hikes,” or add a hike and drop the photos in the chat.</li>
      </ol>
      <p className="hint">
        The client ID is <code>{CLIENT_ID}</code>. Approving the connection is what issues access. <strong>Revoke token</strong>{" "}
        disconnects every approved app and any pasted token. <code>add_hike</code> and <code>add_milestone</code> accept
        JPEG, PNG, GIF, or WebP files dropped in chat, or public image URLs. Deleting stays in the dashboard.
      </p>

      <details className="mcp-fallback">
        <summary>Paste a token instead</summary>
        <p className="hint">
          Generate a token above. In Claude’s config, <code>YOUR_TOKEN</code> is that token, written after <code>Bearer </code>.
        </p>
      <div className="mcp-code">
        <div className="mcp-code-head">
          <span>claude_desktop_config.json</span>
          <button type="button" className="btn btn-ghost" onClick={() => onCopy(claudeConfig, "config")}>
            {copied === "config" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre>{claudeConfig}</pre>
      </div>
      </details>

      <h3>Supported tools</h3>
      <ul className="mcp-tools">
        {TOOLS.map(([name, detail]) => (
          <li key={name}>
            <code>{name}</code>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default McpPanel
