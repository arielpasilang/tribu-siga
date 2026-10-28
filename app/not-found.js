import Link from "next/link"

export const metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <div className="notfound container">
      <div>
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          404
        </span>
        <h1 className="display section-title">You've wandered off the trail</h1>
        <p className="lead" style={{ margin: "0 auto 2rem" }}>
          This page doesn't exist — but the mountain always does. Let's get you
          back to camp.
        </p>
        <Link href="/" className="btn btn-primary">
          ← Back to base camp
        </Link>
      </div>
    </div>
  )
}
