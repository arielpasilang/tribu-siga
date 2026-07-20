import * as React from "react"
import Header from "./header"
import Footer from "./footer"
import "@fontsource-variable/fraunces"
import "@fontsource-variable/outfit"
import "../styles/global.css"

const Layout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
)

export default Layout
