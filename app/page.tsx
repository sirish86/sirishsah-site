import ContactForm from '@/components/ContactForm';

export default function Home() {
  return (
    <div className="wrap">
      <header>
        <a className="logo" href="#top">
          Sirish Sah
        </a>

        <nav>
          <a href="#work">Work</a>
          <a href="/course">Course</a>
          <a href="#contact">Contact</a>
          <a href="/login">Login</a>
          <a href="/login">Create Account</a>
        </nav>

        <a
          className="btn wa"
          href="https://wa.me/916207620864"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp me
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <p className="eyebrow">WEB DEVELOPER · SURAT, INDIA</p>

            <h1>
              I build websites and apps that bring you customers.
            </h1>

            <p>
              Hi, I'm Sirish, a web and app developer in Surat, Gujarat.
              I help businesses build their digital presence.
            </p>

            <a className="btn pri" href="#contact">
              Start a project
            </a>

            <a className="btn ghost" href="/course">
              Explore courses
            </a>
          </div>
        </section>

        <section id="work">
          <h2>Projects</h2>
          <p>Some of my selected work.</p>

          <div className="grid">
            <div className="card">
              <h3>Your first project</h3>
              <p>
                Describe what you built, the technology you used,
                and the problem it solves.
              </p>
              <div className="row">
                <a
                  className="btn pri"
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open demo
                </a>
              </div>
            </div>

            <div className="card">
              <h3>Your second project</h3>
              <p>Add another project description here.</p>
              <div className="row">
                <a className="btn pri" href="#contact">
                  Discuss a project
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact">
          <h2>Let's talk about your project</h2>
          <p>
            Tell me what you want to build. I'll get back to you.
          </p>
          <ContactForm />
        </section>
      </main>

      <footer>
        <p>© 2026 Sirish Sah. All rights reserved.</p>
      </footer>
    </div>
  );
}
