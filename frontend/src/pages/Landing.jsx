import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'AI‑Powered Grading',
    description: 'Evaluate answers with LLMs for instant, consistent scoring across coding and theory questions.',
  },
  {
    title: 'Smart Proctoring',
    description: 'Monitor focus, tab switches, and suspicious activity to keep assessments fair and secure.',
  },
  {
    title: 'Recruiter & Candidate Views',
    description: 'Recruiters get rich insights and leaderboards, candidates get a clean and focused test console.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white text-blue-900">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
              VS
            </div>
            <div>
              <p className="font-semibold text-blue-900 tracking-tight">
                VeriScore AI
              </p>
              <p className="text-xs text-blue-700">
                Proctored Skill Assessments
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-blue-700">
            <a href="#features" className="hover:text-blue-900">
              Features
            </a>
            <a href="#about" className="hover:text-blue-900">
              About
            </a>
            <a href="#contact" className="hover:text-blue-900">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-transparent" />
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100 mb-4">
                  AI‑Driven Hiring · Proctored Assessments
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-blue-900 mb-4">
                  Hire with confidence using{' '}
                  <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
                    VeriScore AI
                  </span>
                </h1>
                <p className="text-base md:text-lg text-blue-800 mb-6">
                  A modern assessment platform that combines AI‑powered grading with intelligent
                  proctoring so recruiters and candidates can focus on what matters: real skills.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <button
                    onClick={handleEnter}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    Enter
                  </button>
                </div>

                <div className="flex flex-wrap gap-6 text-xs text-blue-800">
                  <div>
                    <p className="font-semibold text-blue-900">
                      For Recruiters
                    </p>
                    <p>Auto‑graded reports, skill heatmaps, proctoring logs.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">
                      For Candidates
                    </p>
                    <p>Clean exam console, instant feedback, fair evaluation.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
                <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-emerald-100 blur-3xl" />
                <div className="relative rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-blue-900">
                      Live Proctored Session
                    </p>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Minimal distractions
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-blue-700 mb-1">Tab switches</p>
                      <p className="text-lg font-semibold text-blue-900">0</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-blue-700 mb-1">Webcam flags</p>
                      <p className="text-lg font-semibold text-blue-900">0</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-emerald-700 mb-1">AI score</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        92%
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-blue-100 p-3 text-xs text-blue-800">
                    “VeriScore AI shows me exactly how candidates think through
                    problems – not just if they passed or failed.”
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-12 md:py-16 bg-white border-t border-blue-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-900 mb-2">
                Built for modern, AI‑first hiring
              </h2>
              <p className="text-sm md:text-base text-blue-800">
                VeriScore AI keeps both recruiters and candidates in focus with a minimal, fast UI.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-sm"
                >
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-blue-800">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-12 md:py-16 bg-blue-50/40">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-900 mb-3">
                About VeriScore AI
              </h2>
              <p className="text-sm md:text-base text-blue-800 mb-3">
                VeriScore AI is a proctored assessment platform that combines clean UI with
                practical AI workflows. Inspired by the simplicity and clarity of “Chai aur Code”
                style development, we focus on developer‑friendly APIs and minimal friction.
              </p>
              <p className="text-sm md:text-base text-blue-800">
                Our goal is to help teams validate skills fairly, quickly, and transparently – whether
                you are hiring junior engineers or senior architects.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm text-blue-800">
              <p className="font-semibold text-blue-900 mb-2">
                Why both recruiters & candidates need accounts
              </p>
              <p className="mb-2">
                Every recruiter and candidate on VeriScore AI must create an account before using
                the platform. This ensures secure, auditable sessions and personalized dashboards.
              </p>
              <p>
                Once signed in, recruiters can manage exams and view reports, while candidates can
                join proctored tests with a single click.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-12 md:py-16 bg-white border-t border-blue-100">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-900 mb-3 text-center">
              Contact us
            </h2>
            <p className="text-sm md:text-base text-blue-800 mb-8 text-center">
              Have questions, feedback, or want to onboard your hiring team? Reach out and we’ll get
              back within 1–2 business days.
            </p>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 md:p-8">
              <form className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-1 text-blue-900">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-1 text-blue-900">
                    Work email
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-blue-900">
                    Message
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Tell us briefly about your hiring use case…"
                    className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 flex justify-between items-center">
                  <p className="text-xs text-blue-800">
                    By submitting, you agree to be contacted about VeriScore AI.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
                  >
                    Send message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-800">
          <p>© {new Date().getFullYear()} VeriScore AI. All rights reserved.</p>
          <p>Built with a clean, modern, light UI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

