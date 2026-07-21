import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const links = [
  { to: "/adventures/", label: "Hikes & Milestone" },
  { to: "/gallery/", label: "Gallery" },
  { to: "/about/", label: "About" },
  { to: "/contact/", label: "Contact" },
]

const Header = () => {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const data = useStaticQuery(graphql`
    query {
      logo: file(relativePath: { eq: "logo.jpg" }) {
        childImageSharp {
          gatsbyImageData(width: 40, height: 40, layout: FIXED, placeholder: NONE)
        }
      }
    }
  `)
  const logo = getImage(data.logo)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled || open ? "scrolled" : ""}`}>
      <div className="container inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          {logo && <GatsbyImage image={logo} alt="" className="brand-logo" />}
          TRIBU <span className="tribe">SIGA</span>
        </Link>
        <nav className={`site-nav ${open ? "open" : ""}`}>
          {links.map(l => (
            <Link key={l.to} to={l.to} activeClassName="active" partiallyActive onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  )
}

export default Header
