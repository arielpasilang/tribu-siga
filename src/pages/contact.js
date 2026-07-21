import * as React from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"

const ContactPage = () => (
  <Layout>
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">Join the tribe</span>
        <h1 className="display">Let's climb together</h1>
        <p className="lead">
          Planning a hike, want to join an open climb, or just want to talk
          mountains? We'd love to hear from you.
        </p>
      </div>
    </section>

    <section className="container" style={{ paddingBottom: "6rem" }}>
      <div className="contact-card">
        <span className="eyebrow">Email</span>
        <p style={{ margin: "0.8rem 0 2rem" }}>
          <a className="big-link" href="mailto:tribusigamountaineers@gmail.com">
            tribusigamountaineers@gmail.com
          </a>
        </p>
        <span className="eyebrow">Find us</span>
        <p style={{ marginTop: "0.8rem", color: "var(--text-dim)" }}>
          Facebook: <a href="https://www.facebook.com/tribusigamountaineers" target="_blank" rel="noreferrer">@tribusigamountaineers</a>
          <br />
          Instagram: <a href="https://www.instagram.com/tribusigamountaineers" target="_blank" rel="noreferrer">@tribusigamountaineers</a>
        </p>
        <p style={{ marginTop: "2rem", color: "var(--text-faint)", fontSize: "0.9rem" }}>
          Based in Cebu, Philippines · Open climbs announced on our socials ·
          New members always welcome after completing a Basic Mountaineering
          Course with us.
        </p>
      </div>
    </section>
  </Layout>
)

export const Head = ({ location }) => (
  <Seo
    title="Contact"
    description="Get in touch with Tribu Siga Mountaineers — open climbs, training courses, and new members welcome."
    pathname={location.pathname}
  />
)

export default ContactPage
