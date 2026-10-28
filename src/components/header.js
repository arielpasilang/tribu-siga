"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import logo from "../images/logo.jpg"

const links = [
  { href: "/adventures", label: "Hikes & Milestone" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

function isActive(pathname, href) {
  const path = pathname.replace(/\/$/, "") || "/"
  const target = href.replace(/\/$/, "") || "/"
  if (target === "/") return path === "/"
  return path === target || path.startsWith(`${target}/`)
}

const Header = () => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className={`site-header ${scrolled || open ? "scrolled" : ""}`}>
      <div className="container inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Image src={logo} alt="" width={40} height={40} className="brand-logo" />
          TRIBU <span className="tribe">SIGA</span>
        </Link>
        <nav className={`site-nav ${open ? "open" : ""}`}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  )
}

export default Header
