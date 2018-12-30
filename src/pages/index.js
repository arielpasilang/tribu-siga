import React from "react"
import Layout from "../components/layout"
import { Slide } from "react-slideshow-image"
import slide1 from "../images/slider1.jpg"
import slide2 from "../images/slider-bmc.jpg"
import slide3 from "../images/slider2.jpg"
import slide4 from "../images/kandungaw.jpg"
import slide5 from "../images/apo.jpg"
import slide6 from "../images/anniv.jpg"
import slide7 from "../images/slider31.jpg"
 
const properties = {
  duration: 5000,
  transitionDuration: 500,
  infinite: true,
  indicators: true,
  arrows: true
}

export default () => (
<Layout>
	<div>
        <section id="feat">
            <div class="container">
                <div class="row features">
                    <div class="col-md-4 text-center wow fadeInUp" data-wow-delay="100ms">
                        <span class="typcn typcn-pencil x3"></span>
                        <h4>Facts</h4>
                        <p>Tribu Siga officially started last January 7, 2017. It all started when Edward, Ronald, and Ariel decided to climb Osmena Peak, Dalaguete, Cebu from Badian that is known as halfmoon trail.</p>
                    </div>
                    <div class="col-md-4 text-center wow fadeInUp" data-wow-delay="300ms">
                        <span class="typcn typcn-camera-outline x3"></span>
                        <h4>Mission</h4>
                        <p>We are a group of mountain enthusiast that promotes camaraderie and Leave No Trace. To make a difference in peoples lives in the mountains by being a volunteer and show kindness.</p>
                    </div>
                    <div class="col-md-4 text-center wow fadeInUp" data-wow-delay="500ms">
                        <span class="typcn typcn-bookmark x3"></span>
                        <h4>Next Major Climb</h4>
                        <p>Each year, we plan at least 1 to 2 majors per year. We are looking forward on climbing Mt. Kalatungan and Mt. Halcon in 2019.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="about" class="number wow fadeInUp" data-wow-delay="300ms">
            <div class="container-fluid">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6 opaline col-md-offset-6 pull-right">
                            <div class="row">
                                <div class="col-md-offset-1 col-md-10">
                                    <h3>Why we climb the mountains high?</h3>
                                    <p>Sure, climbing mountains are tiring and can be dangerous! Sometimes we have to travel very far just to get to the top.</p>
                                    <p>But for us, being in the mountains is the best feelings and purest form of exploration. Every mountain has its own hardships and character to conquer. <strong>Every climb is a new challenge to overcome and new memories to make </strong> with our friends. Keep climbing till our body can't.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="photos" className="gallery wow fadeInUp" data-wow-delay="300ms">
        	<h2>Tribu Siga Gallery Area</h2>
        	<Slide {...properties}>
			    <div className="each-slide">
			        <div style={{'backgroundImage': `url(${slide1})`}}>
			        	<div className="transbox">
				 	       <h4>Mt. Talinis, Valencia, Negros Oriental</h4>
				 	       <h5>April 15-18, 2017</h5>
			 	       </div>
			        </div>
			    </div>
			    <div className="each-slide">
			        <div style={{'backgroundImage': `url(${slide2})`}}>
			        <div className="transbox">
			 	       <h4>Basic Mountaineering Course 1</h4>
			 	       <h5>June 12, 2017</h5>
			 	      </div>
			        </div>
			    </div>
			    <div className="each-slide">
			        <div style={{'backgroundImage': `url(${slide3})`}}>
			        <div className="transbox">
			 	       <h4>Mt. Mandalagan, Bacolod, Negros Occidental</h4>
			 	       <h5>Sept 01-03, 2017</h5>
			 	    </div>
			    </div>
				</div>
				<div className="each-slide">
			        <div style={{'backgroundImage': `url(${slide4})`}}>
			        <div className="transbox">
			 	       <h4>Kandungaw Peak, Dalaguete, Cebu</h4>
			 	       <h5>October 07-08, 2017</h5>
			 	    </div>
			        </div>
				</div>
				<div className="each-slide">
			        <div style={{'backgroundImage': `url(${slide5})`}}>
			        <div className="transbox">
			 	       <h4>Mt. Apo Day Hike, Davao</h4>
			 	       <h5>Nov 3, 2017</h5>
			 	    </div>
			        </div>
				</div>
				<div className="each-slide">
			        <div style={{'backgroundImage': `url(${slide6})`}}>
			        <div className="transbox">
			 	       <h4>Tribu Siga 1st Anniversary</h4>
			 	       <h5>January 13-14, 2018</h5>
			 	    </div>
			        </div>
				</div>
				<div className="each-slide">
			        <div style={{'backgroundImage': `url(${slide7})`}}>
			        <div className="transbox">
			 	       <h4>Mt. Guiting Guiting, Sibuyan Island, Romblon</h4>
			 	       <h5>March 30 - April 01, 2018</h5>
			 	    </div>
			        </div>
				</div>
			</Slide>
        </section>
    </div>
</Layout>
)