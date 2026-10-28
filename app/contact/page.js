export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Tribu Siga Mountaineers — open climbs, training courses, and new members welcome.",
}

export default function ContactPage() {
  return (
    <>
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
        <div className="contact-grid">
          <a className="contact-action" href="mailto:tribusigamountaineers@gmail.com">
            <span className="eyebrow">Email</span>
            <strong>Email the tribe</strong>
            <span>tribusigamountaineers@gmail.com</span>
          </a>
          <a
            className="contact-action"
            href="https://www.facebook.com/tribusigamountaineers"
            target="_blank"
            rel="noreferrer"
          >
            <span className="eyebrow">Facebook</span>
            <strong>@tribusigamountaineers</strong>
            <span>Open climbs are announced here</span>
          </a>
          <a
            className="contact-action"
            href="https://www.instagram.com/tribusigamountaineers"
            target="_blank"
            rel="noreferrer"
          >
            <span className="eyebrow">Instagram</span>
            <strong>@tribusigamountaineers</strong>
            <span>Photos from the trail</span>
          </a>
        </div>
        <p className="contact-note">
          Based in Cebu, Philippines. New members are welcome after completing a
          Basic Mountaineering Course with us.
        </p>
      </section>
    </>
  )
}
