import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const CandidateDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/v1/exam/list');
        setExams(res.data.data.exams);
      } catch (err) {
        if (err.response?.status === 404) {
          setExams([]);
        } else {
          setError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load exams.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, []);

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      {/* Nav */}
      <header className="glass border-b border-slate-800/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 via-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              VS
            </div>
            <div>
              <p className="font-semibold tracking-tight text-slate-100">VeriScore AI</p>
              <p className="text-xs text-slate-500">Candidate Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={handleViewProfile}
              className="btn-ghost text-sm"
            >
              Profile
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-200 hover:scale-[1.02]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <section className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Welcome, <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{user?.fullName || user?.username}</span>
          </h1>
          <p className="text-slate-400">
            Available assessments are listed below. AI proctoring activates once you begin.
          </p>
        </section>

        {/* Loading */}
        {loading && (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-sm">Loading available exams…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-5 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && (!exams || exams.length === 0) && (
          <div className="glass rounded-2xl p-10 text-center">
            <span className="text-4xl mb-4 block">📋</span>
            <p className="font-semibold text-slate-200 mb-2">No active exams right now</p>
            <p className="text-slate-500 text-sm">
              Your recruiter hasn't activated an exam yet. Check back later.
            </p>
          </div>
        )}

        {/* Bento Grid */}
        {!loading && !error && exams && exams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam, index) => (
              <div
                key={exam._id}
                className={`glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group flex flex-col justify-between ${
                  index === 0 ? 'md:col-span-2 md:row-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
                      {exam.title}
                    </h2>
                    <span className="flex-shrink-0 ml-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-medium text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-5 line-clamp-2">{exam.description}</p>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3 text-center">
                      <p className="text-xs text-slate-500 mb-0.5">Duration</p>
                      <p className="font-semibold text-slate-200 font-mono-timer">{exam.duration}m</p>
                    </div>
                    <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3 text-center">
                      <p className="text-xs text-slate-500 mb-0.5">Questions</p>
                      <p className="font-semibold text-slate-200 font-mono-timer">{exam.questions?.length || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3 text-center">
                      <p className="text-xs text-slate-500 mb-0.5">Pass</p>
                      <p className="font-semibold text-slate-200 font-mono-timer">{exam.passingScore}%</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/exam/${exam._id}`)}
                  className="btn-primary w-full text-center"
                >
                  Begin Assessment →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CandidateDashboard;
