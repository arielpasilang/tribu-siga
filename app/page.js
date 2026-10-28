import Link from "next/link"
import Image from "next/image"
import AdventureCard from "../src/components/adventure-card"
import { getExpeditions } from "../src/lib/content"
import hero from "../src/images/main-banner.jpg"
import story from "../src/images/mandalagan.jpg"
import cta from "../src/images/join-the-tribe.jpg"

export const revalidate = 60

export default async function HomePage() {
  const adventures = await getExpeditions()
  const featured = adventures.slice(0, 3)

  return (
    <>
      <section className="hero">
        <div className="hero-bg">
          <Image
            src={hero}
            alt="Tribu Siga hikers traversing a cloud-covered ridge"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="container">
          <span className="eyebrow">Est. January 2017 · Cebu, Philippines</span>
          <h1 className="display">
            Keep the flame lit.
            <br />
            <em>Keep climbing.</em>
          </h1>
          <p className="motto">
            “In every mountain we climb, we create wonderful memories, meet
            awesome friends, and a thousand stories to tell.” We are Tribu Siga
            — a tribe of mountain enthusiasts chasing summits across the
            Philippines.
          </p>
          <div className="actions">
            <Link href="/adventures" className="btn btn-primary">
              Our Hikes & Milestone →
            </Link>
            <Link href="/about" className="btn btn-ghost">
              The Story
            </Link>
          </div>
        </div>
        <a className="scroll-cue" href="#story">
          Scroll
        </a>
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

      <section className="section" id="story">
        <div className="container split">
          <div>
            <span className="eyebrow">Why we climb</span>
            <h2 className="display section-title">Every summit is a new story</h2>
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
            <Image
              src={story}
              alt="Camp in a hidden valley on Mt. Mandalagan"
              sizes="(max-width: 820px) 100vw, 45vw"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">The logbook</span>
          <h2 className="display section-title">Latest hikes & milestone</h2>
          <div className="card-grid">
            {featured.map(adventure => (
              <AdventureCard key={adventure.id} adventure={adventure} />
            ))}
          </div>
          <p style={{ marginTop: "2.2rem" }}>
            <Link href="/adventures" className="btn btn-ghost">
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
        <div className="hero-bg">
          <Image
            src={cta}
            alt="Tribu Siga and the community at a tribe gathering"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="container">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Join the tribe
          </span>
          <h2 className="display">The mountains are calling — come with us.</h2>
          <p>
            We run open climbs, training courses, and at least one major
            hike every year. New members are always welcome.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Get in touch →
          </Link>
        </div>
      </section>
    </>
  )
}
