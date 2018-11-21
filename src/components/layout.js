import React from "react"
import Header from "../components/header/header"
import Footer from "../components/footer/footer"
import 'bootstrap/dist/css/bootstrap.min.css'
import './global/css/animate.css'
import './global/css/magnific-popup.css'
import './global/css/pushy.css'
import './global/css/odometer-theme-default.css'
import './global/style.css'
import './global/theme.css'



export default ({ children }) => (
  <div>
  <Header />
    {children}
  <Footer />
  </div>
)