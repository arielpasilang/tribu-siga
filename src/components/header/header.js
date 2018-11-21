import React from "react"
import { Link } from "gatsby"
// import headerStyles from "./header.module.css"

export default () => (
          <div>
            <nav class="pushy pushy-left">
              <ul class="list-unstyled">
                  <li><a href="#home">Home</a></li>
                  <li><a href="#feat">Features</a></li>
                  <li><a href="#about">About me</a></li>
                  <li><a href="#news">My Blog</a></li>
                  <li><a href="#history">My History</a></li>
                  <li><a href="#photos">Look my Photos</a></li>
                  <li><a href="#contact">Get in Touch!</a></li>
                  <li><a href="http://www.themeinthebox.com/ourtheme/mountain-king-bootstrap-template/" target="_blank">Download</a></li>
              </ul>
            </nav>
          <header id="home">
            <div className="container-fluid">
                <div className="container">
                    <div className="row">
                        <div className="col-md-3 col-xs-10">
                            <Link to="/">
                                <div>img area</div>
                            </Link>
                        </div>
                        <div className="col-md-1 col-md-offset-8 col-xs-2 text-center">
                          <div className="menu-btn"><span className="hamburger">&#9776;</span></div>
                        </div>
                    </div>
                    <div className="jumbotron">
                        <h1><small>In the hall of the </small></h1>
                        <h1><strong>Mountain King</strong></h1>
                        <p>This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
                    </div>
                </div>
            </div>
        </header>
        </div>
)