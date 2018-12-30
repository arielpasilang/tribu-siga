import React from "react"
import { Link } from "gatsby"
import Sidebar from "react-sidebar";
// import headerStyles from "./header.module.css"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: false
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }
 
  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }
 
  render() {
    return (
      <div>
      <Sidebar
        sidebar={
            <div className="sidebarinner">
              <h3>Tribu Siga Logo</h3>
              <ul class="list-unstyled">
            <li><a href="/">Home</a></li>
            <li><a href="#about">Why we climb</a></li>
            <li><a href="#photos">Photo Gallery</a></li>
        </ul>
            </div>
       }
        open={this.state.sidebarOpen}
        onSetOpen={this.onSetSidebarOpen}
        styles={{ sidebar: { background: "white" } }}
        sidebarId="sidebarID"
      >

      </Sidebar>
        <header id="home">
            <div className="container-fluid">
                <div className="container">
                    <div className="row">
                        <div className="col-md-10 col-10">
                          <h4><Link to="/">Tribu Siga Mountaineers</Link></h4>
                        </div>
                        <div className="col-md-2 col-2 text-center">
                          <div className="menu-btn"><span className="hamburger" onClick={() => this.onSetSidebarOpen(true)}>&#9776;</span></div>
                        </div>
                    </div>
                    <div className="jumbotron">
                        <h1><small>In the hall of the </small><br />
                        <strong>Mountain King</strong></h1>
                        <br />
                        <p>"In every mountain we climb, we create wonderful memories, meets awesome friends and a thousand stories to tell" 
                        <br />
                        -tribusigamountaineers (Mt. Talinis April 12-15, 2017)</p>
                    </div>
                </div>
            </div>
        </header>
      </div>
    );
  }
}

export default App;