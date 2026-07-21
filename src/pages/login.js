import * as React from "react"
import { navigate } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const LoginPage = () => {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState(null)
  const [submitting, setSubmitting] = React.useState(false)

  const onSubmit = async e => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/.netlify/functions/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Login failed")
      }
      navigate("/dashboard/")
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Tribe only</span>
          <h1 className="display">Log in</h1>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </section>
    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo title="Log in" pathname={location.pathname} noindex />
)

export default LoginPage
