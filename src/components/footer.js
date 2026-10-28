import Link from "next/link"

const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="top">
        <div>
          <Link href="/" className="brand">
            <span className="flame-dot">▲</span>
            TRIBU <span className="tribe">SIGA</span>
          </Link>
          <p className="tagline">
            In every mountain we climb, we create wonderful memories, meet
            awesome friends, and a thousand stories to tell.
          </p>
        </div>
        <nav>
          <Link href="/adventures">Hikes & Milestone</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
      <div className="bottom">
        <span>© {new Date().getFullYear()} Tribu Siga Mountaineers · Cebu, Philippines</span>
        <span>Est. January 7, 2017 · Leave No Trace 🔥</span>
      </div>
    </div>
  </footer>
)

export default Footer
