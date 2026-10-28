import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import ApproveConnection from "../../../src/components/approve-connection"
import { resolveClient } from "../../../src/lib/oauth"
import { SESSION_COOKIE, verifyToken } from "../../../src/lib/session"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Approve connection",
  robots: { index: false, follow: false },
}

export default async function AuthorizePage({ searchParams }) {
  const params = await searchParams
  const fields = {
    response_type: "code",
    client_id: String(params.client_id || ""),
    redirect_uri: String(params.redirect_uri || ""),
    code_challenge: String(params.code_challenge || ""),
    code_challenge_method: String(params.code_challenge_method || ""),
    state: String(params.state || ""),
    scope: String(params.scope || ""),
    resource: String(params.resource || ""),
  }

  let client
  try {
    if (fields.response_type !== "code" || fields.code_challenge_method !== "S256" || !fields.code_challenge) {
      throw new Error("This connection request is missing a secure login check.")
    }
    client = await resolveClient(fields.client_id, fields.redirect_uri)
  } catch (error) {
    return (
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Tribe only</span>
          <h1 className="display">Connection blocked</h1>
          <p className="lead">{error.message}</p>
        </div>
      </section>
    )
  }

  const jar = await cookies()
  const user = await verifyToken(jar.get(SESSION_COOKIE)?.value)
  if (!user) {
    const next = `/oauth/authorize?${new URLSearchParams(fields).toString()}`
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  return (
    <>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">Tribe only</span>
          <h1 className="display">Approve connection</h1>
          <p className="lead">Signed in as {user}.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: "6rem" }}>
        <ApproveConnection
          clientName={client.clientName}
          clientId={fields.client_id}
          redirectHost={new URL(fields.redirect_uri).host}
          fields={fields}
        />
      </section>
    </>
  )
}
