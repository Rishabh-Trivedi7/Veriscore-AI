import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '🧠',
    title: 'AI‑Powered Grading',
    description: 'Evaluate answers with LLMs for instant, consistent scoring across coding and theory questions.',
  },
  {
    icon: '🛡️',
    title: 'Smart Proctoring',
    description: 'Monitor focus, tab switches, and suspicious activity to keep assessments fair and secure.',
  },
  {
    icon: '📊',
    title: 'Recruiter & Candidate Views',
    description: 'Recruiters get rich insights and leaderboards, candidates get a clean and focused test console.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 via-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              VS
            </div>
            <div>
              <p className="font-semibold tracking-tight text-slate-100">VeriScore AI</p>
              <p className="text-xs text-slate-500">Proctored Skill Assessments</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
            <a href="#about" className="hover:text-slate-100 transition-colors">About</a>
            <a href="#contact" className="hover:text-slate-100 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Ambient glow orbs */}
          <div className="pointer-events-none absolute top-20 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="pointer-events-none absolute top-40 right-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px]" />

          <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-medium text-blue-400 mb-6">
                  AI‑Driven Hiring · Proctored Assessments
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-50 mb-5 leading-[1.1]">
                  Hire with confidence using{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent">
                    VeriScore AI
                  </span>
                </h1>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                  A modern assessment platform that combines AI‑powered grading with intelligent
                  proctoring so recruiters and candidates can focus on what matters: real skills.
                </p>
                <div className="flex flex-wrap gap-4 mb-10">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary text-base px-8 py-4"
                  >
                    Get Started →
                  </button>
                </div>

                <div className="flex flex-wrap gap-8 text-sm">
                  <div>
                    <p className="font-semibold text-slate-200">For Recruiters</p>
                    <p className="text-slate-500">Auto‑graded reports, skill heatmaps, proctoring logs.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">For Candidates</p>
                    <p className="text-slate-500">Clean exam console, instant feedback, fair evaluation.</p>
                  </div>
                </div>
              </div>

              {/* Hero preview card */}
              <div className="relative">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-[80px]" />
                <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-emerald-500/15 blur-[80px]" />
                <div className="relative glass rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-semibold text-slate-200">Live Proctored Session</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                      Minimal distractions
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="rounded-xl bg-slate-800/60 border border-slate-700/40 p-4">
                      <p className="text-slate-500 text-xs mb-1">Tab switches</p>
                      <p className="text-xl font-semibold text-slate-100 font-mono-timer">0</p>
                    </div>
                    <div className="rounded-xl bg-slate-800/60 border border-slate-700/40 p-4">
                      <p className="text-slate-500 text-xs mb-1">Webcam flags</p>
                      <p className="text-xl font-semibold text-slate-100 font-mono-timer">0</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                      <p className="text-emerald-400 text-xs mb-1">AI score</p>
                      <p className="text-xl font-semibold text-emerald-400 font-mono-timer">92%</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-700/50 p-4 text-sm text-slate-400 italic">
                    "VeriScore AI shows me exactly how candidates think through
                    problems – not just if they passed or failed."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-24 border-t border-slate-800/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50 mb-3">
                Built for modern, AI‑first hiring
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                VeriScore AI keeps both recruiters and candidates in focus with a minimal, fast UI.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 group"
                >
                  <span className="text-3xl mb-4 block">{feature.icon}</span>
                  <h3 className="font-semibold text-slate-100 mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-20 md:py-24 border-t border-slate-800/60">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50 mb-4">
                About VeriScore AI
              </h2>
              <p className="text-slate-400 mb-4 leading-relaxed">
                VeriScore AI is a proctored assessment platform that combines clean UI with
                practical AI workflows. Inspired by the simplicity and clarity of "Chai aur Code"
                style development, we focus on developer‑friendly APIs and minimal friction.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Our goal is to help teams validate skills fairly, quickly, and transparently – whether
                you are hiring junior engineers or senior architects.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="font-semibold text-slate-100 mb-3 tracking-tight">
                Why both recruiters & candidates need accounts
              </p>
              <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                Every recruiter and candidate on VeriScore AI must create an account before using
                the platform. This ensures secure, auditable sessions and personalized dashboards.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Once signed in, recruiters can manage exams and view reports, while candidates can
                join proctored tests with a single click.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 md:py-24 border-t border-slate-800/60">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50 mb-3 text-center">
              Contact us
            </h2>
            <p className="text-slate-400 mb-10 text-center max-w-xl mx-auto">
              Have questions, feedback, or want to onboard your hiring team? Reach out and we'll get
              back within 1–2 business days.
            </p>
            <div className="glass rounded-2xl p-8">
              <form className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Name</label>
                  <input type="text" placeholder="Your full name" className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Work email</label>
                  <input type="email" placeholder="you@company.com" className="input-dark" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-slate-300">Message</label>
                  <textarea rows="3" placeholder="Tell us briefly about your hiring use case…" className="input-dark resize-none" />
                </div>
                <div className="md:col-span-2 flex justify-between items-center">
                  <p className="text-xs text-slate-500">
                    By submitting, you agree to be contacted about VeriScore AI.
                  </p>
                  <button type="button" className="btn-primary">
                    Send message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VeriScore AI. All rights reserved.</p>
          <p>Built with precision for modern hiring.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
