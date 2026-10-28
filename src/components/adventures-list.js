"use client"

import * as React from "react"
import AdventureCard from "./adventure-card"

const AdventuresList = ({ adventures }) => {
  const categories = ["All", ...new Set(adventures.map(adventure => adventure.category))]
  const [active, setActive] = React.useState("All")

  const shown =
    active === "All"
      ? adventures
      : adventures.filter(adventure => adventure.category === active)

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">The logbook</span>
          <h1 className="display">Hikes & Milestone</h1>
          <p className="lead">
            Every climb since day one — the majors, the day hikes, the training
            days, and the milestones in between.
          </p>
          <div
            className="actions"
            style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "1.8rem" }}
          >
            {categories.map(category => (
              <button
                key={category}
                className={active === category ? "btn btn-primary" : "btn btn-ghost"}
                style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
                onClick={() => setActive(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        {shown.length === 0 ? (
          <p className="lead">Nothing in {active.toLowerCase()} yet.</p>
        ) : (
          <div className="card-grid">
            {shown.map(adventure => (
              <AdventureCard key={adventure.id} adventure={adventure} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default AdventuresList
