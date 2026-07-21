import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import Layout from "../components/layout"
import Seo from "../components/seo"
import AdventureCard from "../components/adventure-card"

const IndexPage = ({ data }) => {
  const hero = getImage(data.hero)
  const story = getImage(data.story)
  const cta = getImage(data.cta)
  const adventures = data.allSanityExpedition.nodes
  const featured = adventures.slice(0, 3)

  return (
    <Layout>
      <section className="hero">
        {hero && (
          <GatsbyImage
            image={hero}
            alt="Tribu Siga hikers traversing a cloud-covered ridge"
            className="hero-bg"
            loading="eager"
            objectFit="cover"
          />
        )}
        <div className="container">
          <span className="eyebrow">Est. January 2017 · Cebu, Philippines</span>
          <h1 className="display">
            Keep the flame lit.<br />
            <em>Keep climbing.</em>
          </h1>
          <p className="motto">
            “In every mountain we climb, we create wonderful memories, meet
            awesome friends, and a thousand stories to tell.” We are Tribu Siga
            — a tribe of mountain enthusiasts chasing summits across the
            Philippines.
          </p>
          <div className="actions">
            <Link to="/adventures/" className="btn btn-primary">
              Our Hikes & Milestone →
            </Link>
            <Link to="/about/" className="btn btn-ghost">
              The Story
            </Link>
          </div>
        </div>
        <span className="scroll-cue">Scroll</span>
      </section>

      <section className="stats">
        <div className="container grid">
          <div className="stat">
            <div className="num">{adventures.length}</div>
            <div className="label">Hikes & Milestone</div>
          </div>
          <div className="stat">
            <div className="num">2,954 m</div>
            <div className="label">Highest Summit — Mt. Apo</div>
          </div>
          <div className="stat">
            <div className="num">4</div>
            <div className="label">Islands Explored</div>
          </div>
          <div className="stat">
            <div className="num">∞</div>
            <div className="label">Stories to Tell</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">Why we climb</span>
            <h2 className="display section-title">
              Every summit is a new story
            </h2>
            <div className="body">
              <p>
                Sure — climbing mountains is tiring, and sometimes dangerous.
                We travel far, carry heavy packs, sleep in the rain, and wake
                up sore. And we keep coming back.
              </p>
              <p>
                For us, being in the mountains is the purest form of
                exploration. Every peak has its own character and its own
                hardships to overcome. <strong>Every climb is a new challenge
                and a new memory made with friends</strong> — and we'll keep
                climbing until our legs say otherwise.
              </p>
            </div>
          </div>
          <div className="photo">
            {story && (
              <GatsbyImage image={story} alt="Camp in a hidden valley on Mt. Mandalagan" />
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">The logbook</span>
          <h2 className="display section-title">Latest hikes & milestone</h2>
          <div className="card-grid">
            {featured.map(node => (
              <AdventureCard key={node.id} adventure={node} />
            ))}
          </div>
          <p style={{ marginTop: "2.2rem" }}>
            <Link to="/adventures/" className="btn btn-ghost">
              Browse the full logbook →
            </Link>
          </p>
        </div>
      </section>

      <section className="section values" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">What we stand for</span>
          <h2 className="display section-title">The tribe code</h2>
          <div className="grid">
            <div className="value-card">
              <div className="icon">🤝</div>
              <h3>Camaraderie</h3>
              <p>
                Nobody summits alone. Like the two climbers in our logo, we
                pull each other up the mountain — on the trail and off it.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">🍃</div>
              <h3>Leave No Trace</h3>
              <p>
                We practice and teach the seven LNT principles on every climb.
                The only things we take are pictures and stories.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">🔥</div>
              <h3>Give Back</h3>
              <p>
                We volunteer in the mountain communities that host us and show
                kindness wherever the trail leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        {cta && (
          <GatsbyImage image={cta} alt="Tribu Siga and the community at a tribe gathering" className="hero-bg" objectFit="cover" />
        )}
        <div className="container">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Join the tribe
          </span>
          <h2 className="display">The mountains are calling — come with us.</h2>
          <p>
            We run open climbs, training courses, and at least one major
            hike every year. New members are always welcome.
          </p>
          <Link to="/contact/" className="btn btn-primary">
            Get in touch →
          </Link>
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query {
    hero: file(relativePath: { eq: "main-banner.jpg" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH, quality: 80)
      }
    }
    story: file(relativePath: { eq: "mandalagan.jpg" }) {
      childImageSharp {
        gatsbyImageData(width: 900)
      }
    }
    cta: file(relativePath: { eq: "join-the-tribe.jpg" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH, quality: 75)
      }
    }
    allSanityExpedition(sort: { date: DESC }) {
      nodes {
        id
        slug {
          current
        }
        title
        dateDisplay
        location
        elevation
        category
        excerpt
        cover {
          asset {
            gatsbyImageData(width: 800, aspectRatio: 1.6)
          }
        }
      }
    }
  }
`

export const Head = ({ location }) => <Seo pathname={location.pathname} />

export default IndexPage
