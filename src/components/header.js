import * as React from "react"
import { Link } from "gatsby"

const links = [
  { to: "/adventures/", label: "Hikes & Milestone" },
  { to: "/gallery/", label: "Gallery" },
  { to: "/about/", label: "About" },
  { to: "/contact/", label: "Contact" },
]

const Header = () => {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

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
          <span className="flame-dot">▲</span>
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
