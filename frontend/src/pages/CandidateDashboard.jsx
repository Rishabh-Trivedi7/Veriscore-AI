import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

/* ─── Icons (inline SVG) ────────────────────────────────────────── */
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
  </svg>
);
const IconExams = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const IconResults = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

/* ─── Greeting helper ───────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── Shared UI helpers ─────────────────────────────────────────── */
const Spinner = ({ text }) => (
  <div style={{ textAlign: 'center', padding: '56px 24px', borderRadius: '20px', background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(30,41,59,0.6)' }}>
    <div style={{
      width: '28px', height: '28px',
      border: '3px solid rgba(59,130,246,0.25)',
      borderTopColor: '#3b82f6', borderRadius: '50%',
      margin: '0 auto 14px',
      animation: 'cdSpin 0.7s linear infinite',
    }} />
    <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>{text}</p>
  </div>
);

const ErrorBanner = ({ msg }) => (
  <div style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px' }}>{msg}</div>
);

const EmptyState = ({ icon, title, desc }) => (
  <div style={{ textAlign: 'center', padding: '60px 24px', borderRadius: '20px', background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(30,41,59,0.6)' }}>
    <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>{icon}</span>
    <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '17px', color: '#e2e8f0' }}>{title}</p>
    <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{desc}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const CandidateDashboard = () => {
  const [activeTab, setActiveTab] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* fetch exams when tab switches to exams */
  useEffect(() => {
    if (activeTab !== 'exams') return;
    if (exams.length > 0) return;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await api.get('/api/v1/exam/list');
        setExams(res.data.data.exams);
      } catch (err) {
        if (err.response?.status === 404) setExams([]);
        else setError(err.response?.data?.message || 'Failed to load exams.');
      } finally { setLoading(false); }
    })();
  }, [activeTab]);

  /* fetch results when tab switches to results */
  useEffect(() => {
    if (activeTab !== 'results') return;
    if (results.length > 0) return;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await api.get('/api/v1/exam/results');
        setResults(res.data.data.results);
      } catch { setError('Failed to load past results.'); }
      finally { setLoading(false); }
    })();
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { id: 'welcome',  label: 'Home',               icon: <IconHome /> },
    { id: 'exams',    label: 'Available Exams',    icon: <IconExams /> },
    { id: 'results',  label: 'Results & Feedback', icon: <IconResults /> },
    { id: 'profile',  label: 'Profile',             icon: <IconProfile /> },
  ];

  const displayName = user?.fullName || user?.username || 'Candidate';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  /* ── Sidebar nav button ── */
  const NavBtn = ({ item }) => {
    const isActive = activeTab === item.id;
    const [hovered, setHovered] = useState(false);
    return (
      <button
        onClick={() => setActiveTab(item.id)}
        title={!sidebarOpen ? item.label : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center',
          gap: '12px',
          padding: sidebarOpen ? '11px 14px' : '11px',
          borderRadius: '12px', border: 'none', cursor: 'pointer',
          width: '100%', textAlign: 'left',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          transition: 'all 0.2s ease',
          background: isActive
            ? 'rgba(59,130,246,0.13)'
            : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
          color: isActive ? '#60a5fa' : hovered ? '#e2e8f0' : '#94a3b8',
          borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
          fontWeight: isActive ? 600 : 400,
          fontSize: '14px',
          letterSpacing: '-0.2px',
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
        <span style={{
          overflow: 'hidden', whiteSpace: 'nowrap',
          transition: 'opacity 0.25s, max-width 0.35s cubic-bezier(0.4,0,0.2,1)',
          opacity: sidebarOpen ? 1 : 0,
          maxWidth: sidebarOpen ? '200px' : '0px',
        }}>{item.label}</span>
      </button>
    );
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--obsidian)', color: 'var(--text-primary)',
      fontFamily: 'Inter, -apple-system, sans-serif', overflow: 'hidden',
    }}>
      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        minHeight: '100vh',
        background: 'rgba(8,12,22,0.97)',
        borderRight: '1px solid rgba(30,41,59,0.7)',
        backdropFilter: 'blur(24px)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        zIndex: 50,
      }}>
        {/* Brand row — two distinct states to avoid overflow */}
        <div style={{
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid rgba(30,41,59,0.6)',
          minHeight: '72px',
          padding: sidebarOpen ? '0 16px 0 20px' : '0',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: '12px',
          overflow: 'hidden',
        }}>
          {sidebarOpen ? (
            /* ── EXPANDED: logo + text + close button ── */
            <>
              {/* Logo mark */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                background: 'linear-gradient(135deg,#3b82f6,#10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '12px', color: '#fff',
                boxShadow: '0 0 16px rgba(59,130,246,0.4)',
              }}>VS</div>

              {/* Brand text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: '#f1f5f9', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>VeriScore AI</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#475569', whiteSpace: 'nowrap' }}>Candidate Portal</p>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                title="Collapse sidebar"
                style={{
                  flexShrink: 0,
                  background: 'rgba(30,41,59,0.5)',
                  border: '1px solid rgba(51,65,85,0.4)',
                  borderRadius: '8px', color: '#94a3b8',
                  padding: '6px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.color = '#60a5fa'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <IconClose />
              </button>
            </>
          ) : (
            /* ── COLLAPSED: only the hamburger, perfectly centered ── */
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand sidebar"
              style={{
                background: 'rgba(30,41,59,0.5)',
                border: '1px solid rgba(51,65,85,0.4)',
                borderRadius: '8px', color: '#94a3b8',
                padding: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.color = '#60a5fa'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <IconMenu />
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map(item => <NavBtn key={item.id} item={item} />)}
        </nav>

        {/* Bottom: user chip + logout */}
        <div style={{ borderTop: '1px solid rgba(30,41,59,0.6)', padding: '10px 10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* User chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: sidebarOpen ? '10px 12px' : '10px',
            borderRadius: '12px',
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(30,41,59,0.6)',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#fff',
              overflow: 'hidden',
            }}>
              {user?.profilePicture
                ? <img src={getFullUrl(user.profilePicture)} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{
              overflow: 'hidden',
              transition: 'opacity 0.25s, max-width 0.35s cubic-bezier(0.4,0,0.2,1)',
              opacity: sidebarOpen ? 1 : 0,
              maxWidth: sidebarOpen ? '160px' : '0px',
              whiteSpace: 'nowrap',
            }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>Candidate</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? 'Logout' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: sidebarOpen ? '11px 14px' : '11px',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              width: '100%', justifyContent: sidebarOpen ? 'flex-start' : 'center',
              background: 'transparent', color: '#f87171',
              fontSize: '14px', fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ flexShrink: 0, display: 'flex' }}><IconLogout /></span>
            <span style={{
              overflow: 'hidden', whiteSpace: 'nowrap',
              transition: 'opacity 0.25s, max-width 0.35s cubic-bezier(0.4,0,0.2,1)',
              opacity: sidebarOpen ? 1 : 0,
              maxWidth: sidebarOpen ? '200px' : '0px',
            }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', height: '100vh' }}>
        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(30,41,59,0.55)',
          padding: '0 32px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
            {navItems.find(n => n.id === activeTab)?.label}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#1e293b', fontFamily: 'monospace' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '40px 36px', maxWidth: '1100px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {activeTab === 'welcome' && (
            <WelcomeView displayName={displayName} initials={initials} user={user} getFullUrl={getFullUrl} onNavigate={setActiveTab} />
          )}
          {activeTab === 'exams' && (
            <ExamsView exams={exams} loading={loading} error={error} onStart={id => navigate(`/exam/${id}`)} />
          )}
          {activeTab === 'results' && (
            <ResultsView results={results} loading={loading} error={error} expandedFeedback={expandedFeedback} setExpandedFeedback={setExpandedFeedback} />
          )}
          {activeTab === 'profile' && (
            <ProfileView user={user} getFullUrl={getFullUrl} />
          )}
        </main>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes cdSpin      { to { transform: rotate(360deg); } }
        @keyframes cdFadeUp    { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cdFadeIn    { from { opacity: 0; } to { opacity: 1; } }
        .cd-fadeup  { animation: cdFadeUp 0.48s cubic-bezier(0.4,0,0.2,1) both; }
        .cd-fadein  { animation: cdFadeIn 0.35s ease both; }
        .cd-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 14px 40px rgba(59,130,246,0.13); }
        .cd-card    { transition: transform 0.25s ease, box-shadow 0.25s ease; }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   WELCOME VIEW
═══════════════════════════════════════════════════════════════════ */
const WelcomeView = ({ displayName, initials, user, getFullUrl, onNavigate }) => {
  const greeting = getGreeting();
  const quickLinks = [
    { id: 'exams',   emoji: '📋', label: 'Available Exams',    desc: 'Browse and start proctored assessments', color: '#3b82f6' },
    { id: 'results', emoji: '📈', label: 'Results & Feedback', desc: 'View scores and AI skill gap analysis',   color: '#10b981' },
    { id: 'profile', emoji: '👤', label: 'My Profile',         desc: 'Manage your personal information',        color: '#8b5cf6' },
  ];

  return (
    <div className="cd-fadeup">
      {/* Hero card */}
      <div style={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.13) 0%, rgba(139,92,246,0.08) 60%, rgba(16,185,129,0.07) 100%)',
        border: '1px solid rgba(59,130,246,0.18)',
        padding: '44px 48px', marginBottom: '32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.09), transparent 70%)', pointerEvents: 'none' }} />

        {/* Avatar + greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div style={{
            width: '76px', height: '76px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 800, color: '#fff',
            boxShadow: '0 0 32px rgba(59,130,246,0.45)',
            border: '3px solid rgba(59,130,246,0.28)',
            overflow: 'hidden',
          }}>
            {user?.profilePicture
              ? <img src={getFullUrl(user.profilePicture)} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div>
            <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{greeting}</p>
            <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#f1f5f9', lineHeight: 1.1 }}>
              Hello,{' '}
              <span style={{ background: 'linear-gradient(90deg,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {displayName}
              </span>! 👋
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>
              Welcome to <strong style={{ color: '#94a3b8' }}>VeriScore AI</strong> — your intelligent, AI-proctored assessment portal.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(59,130,246,0.12)', margin: '0 0 24px' }} />

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: 'Secure', sub: 'AI Proctored', c: '#34d399' },
            { label: 'Real-time', sub: 'Analysis', c: '#60a5fa' },
            { label: 'Instant', sub: 'Feedback', c: '#a78bfa' },
          ].map(chip => (
            <div key={chip.label} style={{
              padding: '7px 16px', borderRadius: '999px',
              background: 'rgba(15,23,42,0.65)',
              border: `1px solid ${chip.c}28`,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: chip.c, display: 'inline-block', boxShadow: `0 0 6px ${chip.c}` }} />
              <span style={{ fontSize: '12px', color: chip.c, fontWeight: 700 }}>{chip.label}</span>
              <span style={{ fontSize: '12px', color: '#475569' }}>{chip.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#334155', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Quick Access</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {quickLinks.map((link, i) => (
          <button
            key={link.id}
            className="cd-card"
            onClick={() => onNavigate(link.id)}
            style={{
              textAlign: 'left', cursor: 'pointer',
              padding: '24px 26px', borderRadius: '20px',
              background: 'rgba(15,23,42,0.5)',
              border: '1px solid rgba(30,41,59,0.8)',
              backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'flex-start', gap: '18px',
              animation: `cdFadeUp 0.48s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s both`,
            }}
          >
            <div style={{
              width: '50px', height: '50px', borderRadius: '14px', flexShrink: 0,
              background: `${link.color}16`,
              border: `1px solid ${link.color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
            }}>{link.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 5px', fontWeight: 700, fontSize: '15px', color: '#e2e8f0' }}>{link.label}</p>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{link.desc}</p>
              <p style={{ margin: 0, fontSize: '12px', color: link.color, fontWeight: 700 }}>Open →</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   EXAMS VIEW
═══════════════════════════════════════════════════════════════════ */
const ExamsView = ({ exams, loading, error, onStart }) => (
  <div className="cd-fadeup">
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>Available Assessments</h2>
      <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>AI proctoring activates once you begin. Ensure a stable connection and well-lit environment.</p>
    </div>

    {loading && <Spinner text="Loading exams…" />}
    {!loading && error && <ErrorBanner msg={error} />}
    {!loading && !error && (!exams || exams.length === 0) && (
      <EmptyState icon="📋" title="No active exams right now" desc="Your recruiter hasn't activated an exam yet. Check back later." />
    )}
    {!loading && !error && exams && exams.length > 0 && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {exams.map((exam, idx) => (
          <div key={exam._id} className="cd-card" style={{
            borderRadius: '20px',
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(30,41,59,0.8)',
            backdropFilter: 'blur(16px)',
            padding: '26px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            animation: `cdFadeUp 0.45s cubic-bezier(0.4,0,0.2,1) ${idx * 0.07}s both`,
            gridColumn: idx === 0 && exams.length > 2 ? 'span 2' : undefined,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px', lineHeight: '1.3', flex: 1 }}>{exam.title}</h3>
                <span style={{
                  flexShrink: 0, marginLeft: '12px', padding: '4px 12px', borderRadius: '999px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  fontSize: '10px', fontWeight: 800, color: '#34d399', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Active</span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                {exam.description || 'Proctored assessment environment'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Duration', value: `${exam.duration}m` },
                  { label: 'Questions', value: exam.questions?.length || 0 },
                  { label: 'Pass Mark', value: `${exam.passingScore}%` },
                ].map(s => (
                  <div key={s.label} style={{
                    borderRadius: '12px', background: 'rgba(30,41,59,0.5)',
                    border: '1px solid rgba(51,65,85,0.35)', padding: '10px 8px', textAlign: 'center',
                  }}>
                    <p style={{ margin: '0 0 3px', fontSize: '10px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onStart(exam._id)}
              style={{
                width: '100%', padding: '13px',
                borderRadius: '13px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                color: '#fff', fontWeight: 700, fontSize: '14px', letterSpacing: '-0.2px',
                transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(59,130,246,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.3)'; }}
            >Begin Assessment →</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   RESULTS VIEW
═══════════════════════════════════════════════════════════════════ */
const ResultsView = ({ results, loading, error, expandedFeedback, setExpandedFeedback }) => {
  const statusMap = {
    selected: { label: 'Selected for Next Round', color: '#34d399', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
    rejected: { label: 'Not Selected',            color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
    pending:  { label: 'Review Pending',           color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  };

  return (
    <div className="cd-fadeup">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>Results & Feedback</h2>
        <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Your assessment performance and AI-generated skill gap analysis.</p>
      </div>

      {loading && <Spinner text="Loading results…" />}
      {!loading && error && <ErrorBanner msg={error} />}
      {!loading && !error && (!results || results.length === 0) && (
        <EmptyState icon="📈" title="No results yet" desc="You haven't completed any assessments yet. Head over to Available Exams." />
      )}
      {!loading && !error && results && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {results.map((result, i) => {
            const isExpanded = expandedFeedback === result._id;
            const hasFeedback = result.aiGrading?.summary;
            const s = statusMap[result.status] || statusMap.pending;
            return (
              <div key={result._id} style={{
                borderRadius: '20px', background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(16px)', overflow: 'hidden',
                animation: `cdFadeUp 0.45s cubic-bezier(0.4,0,0.2,1) ${i * 0.07}s both`,
              }}>
                <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px' }}>
                      {result.examId?.title || 'Unknown Assessment'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span>Score: <strong style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{result.score}%</strong></span>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1e293b', display: 'inline-block' }} />
                      <span>{new Date(result.submittedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '6px 16px', borderRadius: '999px',
                      background: s.bg, border: `1px solid ${s.border}`,
                      fontSize: '11px', fontWeight: 800, color: s.color,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{s.label}</span>
                    {hasFeedback && (
                      <button
                        onClick={() => setExpandedFeedback(isExpanded ? null : result._id)}
                        style={{
                          padding: '6px 16px', borderRadius: '12px',
                          background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(51,65,85,0.5)',
                          color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60a5fa'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.7)'; e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        {isExpanded ? 'Hide Feedback ↑' : 'View Feedback ↓'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable AI feedback */}
                {isExpanded && hasFeedback && (
                  <div style={{ padding: '0 28px 24px', animation: 'cdFadeUp 0.3s ease both' }}>
                    <div style={{ padding: '22px', borderRadius: '16px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✦</span> AI Skill Gap Analysis
                      </h4>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: '1.75' }}>{result.aiGrading.summary}</p>
                      {result.aiGrading.gaps?.length > 0 && (
                        <div style={{ marginTop: '18px' }}>
                          <p style={{ margin: '0 0 10px', fontSize: '10px', color: '#334155', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Identified Gaps</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {result.aiGrading.gaps.map((gap, gi) => (
                              <span key={gi} style={{
                                padding: '4px 14px', borderRadius: '999px',
                                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)',
                                fontSize: '11px', fontWeight: 700, color: '#f87171',
                                letterSpacing: '0.06em', textTransform: 'uppercase',
                              }}>{gap}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PROFILE VIEW (inline — no page navigation required)
═══════════════════════════════════════════════════════════════════ */
const ProfileView = ({ user, getFullUrl }) => {
  const { setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
  });
  const [files, setFiles] = useState({ profilePicture: null, resume: null });

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('fullName', formData.fullName);
      if (files.profilePicture) data.append('profilePicture', files.profilePicture);
      if (files.resume) data.append('resume', files.resume);
      const res = await api.patch('/api/v1/auth/update-profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const initials = (user.fullName || user.username || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const fieldStyle = { padding: '11px 14px', borderRadius: '12px', background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(51,65,85,0.3)', color: '#94a3b8', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
  const inputStyle = { ...fieldStyle, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)', color: '#e2e8f0', outline: 'none' };

  return (
    <div className="cd-fadeup">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>My Profile</h2>
          <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Manage your personal information visible to recruiters.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff',
              fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 22px rgba(59,130,246,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.3)'}
          >Edit Profile</button>
        )}
      </div>

      {error   && <div style={{ marginBottom: '16px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px' }}>{error}</div>}
      {success && <div style={{ marginBottom: '16px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: '14px' }}>{success}</div>}

      <div style={{ borderRadius: '20px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(16px)', padding: '32px 36px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Avatar column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden',
            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', fontWeight: 800, color: '#fff',
            boxShadow: '0 0 32px rgba(59,130,246,0.4)',
            border: '3px solid rgba(59,130,246,0.25)',
            position: 'relative',
          }}>
            {user.profilePicture
              ? <img src={getFullUrl(user.profilePicture)} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
            {isEditing && (
              <label style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', borderRadius: '50%',
                fontSize: '11px', color: '#fff', fontWeight: 700, textAlign: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
              >
                Change
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => { if (e.target.files?.[0]) setFiles(p => ({ ...p, profilePicture: e.target.files[0] })); }} />
              </label>
            )}
          </div>
          <span style={{ fontSize: '11px', padding: '4px 14px', borderRadius: '999px', background: 'rgba(59,130,246,0.09)', border: '1px solid rgba(59,130,246,0.22)', color: '#60a5fa', fontWeight: 700 }}>
            {user.role}
          </span>
        </div>

        {/* Fields column */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Full Name',       name: 'fullName',  value: user.fullName,  type: 'text'  },
              { label: 'Username',        name: 'username',  value: user.username,  type: 'text'  },
              { label: 'Email',           name: 'email',     value: user.email,     type: 'email' },
            ].map(f => (
              <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{f.label}</label>
                {isEditing
                  ? <input type={f.type} value={formData[f.name]} onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))} style={inputStyle} />
                  : <div style={fieldStyle}>{f.value || 'N/A'}</div>}
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Account Created</label>
              <div style={fieldStyle}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</div>
            </div>
          </div>

          {/* Resume */}
          <div style={{ marginBottom: '22px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Resume</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {user.resume && (
                <a href={getFullUrl(user.resume)} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '9px 18px', borderRadius: '12px', background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.22)', color: '#34d399', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  View Resume ↗
                </a>
              )}
              {isEditing && (
                <label style={{ cursor: 'pointer', padding: '9px 18px', borderRadius: '12px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                  {files.resume ? files.resume.name : 'Upload New Resume'}
                  <input type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={e => { if (e.target.files?.[0]) setFiles(p => ({ ...p, resume: e.target.files[0] })); }} />
                </label>
              )}
            </div>
          </div>

          {/* Save / Cancel */}
          {isEditing && (
            <div style={{ display: 'flex', gap: '10px', paddingTop: '18px', borderTop: '1px solid rgba(30,41,59,0.6)' }}>
              <button
                onClick={handleSave} disabled={loading}
                style={{ padding: '11px 26px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', fontWeight: 700, fontSize: '14px', opacity: loading ? 0.6 : 1, transition: 'all 0.2s' }}
              >{loading ? 'Saving…' : 'Save Changes'}</button>
              <button
                onClick={() => { setIsEditing(false); setFormData({ username: user.username, email: user.email, fullName: user.fullName || '' }); setFiles({ profilePicture: null, resume: null }); setError(''); }}
                style={{ padding: '11px 20px', borderRadius: '12px', border: '1px solid rgba(51,65,85,0.5)', background: 'transparent', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
              >Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
