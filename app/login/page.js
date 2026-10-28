import LoginForm from "../../src/components/login-form"

export const metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Tribe only</span>
          <h1 className="display">Log in</h1>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "6rem" }}>
        <LoginForm />
      </section>
    </>
  )
}
