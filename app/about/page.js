import Link from "next/link"
import Image from "next/image"
import groupPhoto from "../../src/images/talinis.jpg"
import logo from "../../src/images/logo.jpg"

export const metadata = {
  title: "About",
  description:
    "The story of Tribu Siga Mountaineers — founded January 7, 2017 on the Halfmoon Trail to Osmeña Peak, Cebu.",
}

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">The story</span>
          <h1 className="display">Three friends, one trail, a whole tribe</h1>
          <p className="lead">
            Tribu Siga Mountaineers officially started on January 7, 2017, when
            Edward, Ronald, and Ariel climbed Osmeña Peak from Badian via the
            famous Halfmoon Trail — and decided the adventure shouldn't end
            there.
          </p>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="split">
          <div className="photo">
            <Image
              src={groupPhoto}
              alt="The tribe at Lake Nailig, Mt. Talinis"
              sizes="(max-width: 820px) 100vw, 45vw"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div>
            <span className="eyebrow">Who we are</span>
            <h2 className="display section-title">A tribe, not a club</h2>
            <div className="body">
              <p>
                <em>Siga</em> is Cebuano for flame — and for someone with the
                nerve to take on anything. Both fit. We are a group of mountain
                enthusiasts based in Cebu who promote camaraderie and practice
                Leave No Trace on every climb.
              </p>
              <p>
                What started as three friends on a day hike has grown into a
                family of trained mountaineers with summits across the Visayas
                and Mindanao — including <strong>Mt. Apo</strong>, the highest
                point in the Philippines, and <strong>Mt. Guiting-Guiting</strong>,
                the most technical climb in the country.
              </p>
              <p>
                We aim to make a difference in the mountain communities we
                visit — volunteering, giving back, and showing kindness along
                the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="split">
          <div>
            <span className="eyebrow">The mark</span>
            <h2 className="display section-title">Two climbers, one rope</h2>
            <div className="body">
              <p>
                Our logo tells you everything about how we climb: one
                mountaineer reaching back to pull the other up to the summit,
                framed by jagged peaks and a rising sun.
              </p>
              <p>
                Nobody gets left on the trail. That's been the rule since day
                one on the Halfmoon Trail, and it's the rule on every hike we
                run.
              </p>
            </div>
          </div>
          <div className="photo tilt-right" style={{ background: "#fff", padding: "2rem" }}>
            <Image
              src={logo}
              alt="Tribu Siga Mountaineers logo"
              sizes="(max-width: 820px) 100vw, 40vw"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </section>

      <section className="section values" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">How we operate</span>
          <h2 className="display section-title">Skills before summits</h2>
          <div className="grid">
            <div className="value-card">
              <div className="icon">🧭</div>
              <h3>We train</h3>
              <p>
                We run Basic Mountaineering Courses covering navigation,
                campcraft, first aid, and trip planning — every member earns
                their certificate before the big climbs.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">⛰️</div>
              <h3>We go big</h3>
              <p>
                At least one or two major climbs every year — from the Horns of
                Negros to the knife edge of G2 and the roof of the Philippines.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">🍃</div>
              <h3>We leave no trace</h3>
              <p>
                Seven principles, zero shortcuts. The mountains we love stay
                wild because everyone who climbs with us learns to keep them
                that way.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <div className="actions" style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
          <Link href="/adventures" className="btn btn-primary">
            See where we've been →
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Join a climb
          </Link>
        </div>
      </section>
    </>
  )
}
