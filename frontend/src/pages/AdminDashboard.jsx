import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import api, { API_BASE_URL } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [viewMode, setViewMode] = useState('exams'); // 'exams' or 'results'
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, examsRes] = await Promise.all([
        api.get('/api/v1/admin/dashboard-stats'),
        api.get('/api/v1/admin/exams')
      ]);
      setStats(statsRes.data.data);
      setExams(examsRes.data.data.exams);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamSubmissions = async (examId) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/admin/exams/${examId}/reports`);
      setSubmissions(res.data.data.submissions);
      setViewMode('results');
    } catch (err) {
      setError('Failed to fetch submissions for this assessment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  const getCurrentExamStats = () => {
    if (!selectedExam || !submissions.length) {
      return {
        totalSubmissions: 0,
        passRate: 0,
        avgTrustScore: 0,
      };
    }

    const totalSubmissions = submissions.length;
    const passedCount = submissions.filter((s) => {
      const score = s.manualScore ?? s.score ?? 0;
      const passing = selectedExam?.passingScore ?? s.examId?.passingScore ?? 0;
      return score >= passing;
    }).length;

    const avgTrustScore =
      submissions.reduce(
        (sum, s) => sum + (s.computedTrustScore ?? s.trustScore ?? 0),
        0
      ) / totalSubmissions;

    return {
      totalSubmissions,
      passRate:
        totalSubmissions > 0
          ? Number(((passedCount / totalSubmissions) * 100).toFixed(2))
          : 0,
      avgTrustScore: Number(avgTrustScore.toFixed(2)),
    };
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-xl text-blue-400 font-medium animate-pulse tracking-tight">Syncing Intelligence...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      {/* Header */}
      <nav className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-xl tracking-tight text-slate-100">VeriScore <span className="text-blue-400">Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/create-exam')}
              className="btn-primary text-xs px-4 py-2"
            >
              + Create Assessment
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition-all border border-rose-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Results View */}
        {viewMode === 'results' && (
          <div className="glass rounded-3xl overflow-hidden mb-10 animate-in slide-in-from-right-4 duration-500">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <button 
                  onClick={() => setViewMode('exams')}
                  className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1 hover:-translate-x-1 transition-transform"
                >
                  ← Back to Assessment Registry
                </button>
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Audit: {selectedExam?.title}</h2>
              </div>
              {(() => {
                const { totalSubmissions, passRate, avgTrustScore } = getCurrentExamStats();
                return (
                  <div className="grid grid-cols-3 gap-4 text-right ml-8">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Attempts</p>
                      <p className="text-xl font-bold text-slate-100 font-mono-timer">{totalSubmissions}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pass Rate</p>
                      <p className="text-xl font-bold text-emerald-400 font-mono-timer">{passRate}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Trust</p>
                      <p className="text-xl font-bold text-blue-400 font-mono-timer">{avgTrustScore}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-left">
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Rank</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Score</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Trust</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-light">
                  {submissions.map((sub, index) => (
                    <tr key={sub._id} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="py-5 px-6">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(sub.candidateId)}
                          className="text-left"
                        >
                          <div className="font-semibold text-slate-100 underline decoration-dotted underline-offset-2 hover:text-blue-400">
                            {sub.candidateId?.fullName || sub.candidateId?.username}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{sub.candidateId?.email}</div>
                        </button>
                      </td>
                      <td className="py-5 px-6 text-center">
                        {index === 0 && <span className="text-xl" title="Gold Rank">🥇</span>}
                        {index === 1 && <span className="text-xl" title="Silver Rank">🥈</span>}
                        {index === 2 && <span className="text-xl" title="Bronze Rank">🥉</span>}
                        {index > 2 && <span className="text-slate-500 font-mono">#{index + 1}</span>}
                      </td>
                  <td className="py-5 px-6 font-bold text-slate-100 text-center font-mono-timer">
                    {sub.manualScore ?? sub.score ?? 0}
                  </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          (sub.computedTrustScore ?? sub.trustScore ?? 0) > 80
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {(sub.computedTrustScore ?? sub.trustScore ?? 0).toFixed
                            ? (sub.computedTrustScore ?? sub.trustScore ?? 0).toFixed(2)
                            : (sub.computedTrustScore ?? sub.trustScore ?? 0)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="text-blue-400 hover:text-blue-300 font-bold text-[10px] tracking-widest transition-colors"
                        >
                          VIEW AUDIT
                        </button>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-slate-600 italic">No attempts recorded for this assessment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="glass w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative border border-white/5 animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-white/5 sticky top-0 glass z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 tracking-tight">Intelligence Audit Report</h3>
                  <p className="text-slate-500 text-xs font-mono">{selectedSubmission.candidateId?.fullName} · {selectedSubmission.examId?.title}</p>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="btn-ghost p-2 text-2xl">×</button>
              </div>

              <div className="p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Result</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-xl font-bold leading-none ${
                        (selectedSubmission.manualScore ?? selectedSubmission.score ?? 0) >= (selectedSubmission.examId?.passingScore || 0)
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}>
                        {(selectedSubmission.manualScore ?? selectedSubmission.score ?? 0) >= (selectedSubmission.examId?.passingScore || 0)
                          ? 'Pass'
                          : 'Fail'}
                      </p>
                      {(selectedSubmission.manualScore ?? selectedSubmission.score ?? 0) >= (selectedSubmission.examId?.passingScore || 0) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded glow-emerald animate-pulse">
                          RANK #{submissions.findIndex(s => s._id === selectedSubmission._id) + 1}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Score</p>
                    <p className="text-xl font-bold leading-none text-slate-100 font-mono-timer">
                      {(selectedSubmission.manualScore ?? selectedSubmission.score ?? 0)}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trust Index</p>
                    <p className={`text-xl font-bold leading-none font-mono-timer ${
                      (selectedSubmission.computedTrustScore ?? selectedSubmission.trustScore ?? 0) > 80
                        ? 'text-emerald-400'
                        : (selectedSubmission.computedTrustScore ?? selectedSubmission.trustScore ?? 0) > 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {(selectedSubmission.computedTrustScore ?? selectedSubmission.trustScore ?? 0).toFixed
                        ? (selectedSubmission.computedTrustScore ?? selectedSubmission.trustScore ?? 0).toFixed(2)
                        : (selectedSubmission.computedTrustScore ?? selectedSubmission.trustScore ?? 0)}
                    </p>
                  </div>
                </div>

                {/* AI & Proctoring Intelligence */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-8">
                  <div className="glass-light p-6 rounded-2xl">
                    <h4 className="font-bold text-slate-100 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center text-[10px] font-black">!</span>
                      Security Watchlist
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {selectedSubmission.violationLogs?.length > 0 ? (
                        selectedSubmission.violationLogs.map((log, i) => (
                          <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] leading-tight">
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="font-bold uppercase text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                {log.type}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-slate-400 leading-normal">{log.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                          <span className="text-3xl mb-2">🛡️</span>
                          <p className="text-sm italic">Clean record. Assessment protocol maintained.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Summary (Gemini) */}
                <div className="mb-8">
                  <h4 className="font-bold text-slate-100 mb-4 text-sm tracking-tight capitalize">Gemini Skill Analysis</h4>
                  <div className="p-6 bg-blue-500/[0.03] rounded-2xl border border-blue-500/10">
                    <p className="text-slate-300 leading-relaxed italic text-sm">
                      "{selectedSubmission.aiGrading?.summary || 'Analytical summary pending for this audit.'}"
                    </p>
                    {selectedSubmission.aiGrading?.gaps?.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {selectedSubmission.aiGrading.gaps.map((gap, i) => (
                          <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Gap: {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical artifacts removed as requested */}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-obsidian/80 backdrop-blur-xl p-4">
          <div className="glass rounded-3xl max-w-md w-full border border-white/10 shadow-2xl relative">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">Candidate Profile</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedCandidate.email}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="btn-ghost text-xl px-2"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-slate-500 text-xl">
                  {selectedCandidate.profilePicture ? (
                    <img
                      src={getAssetUrl(selectedCandidate.profilePicture)}
                      alt={selectedCandidate.fullName || selectedCandidate.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (selectedCandidate.fullName || selectedCandidate.username || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {selectedCandidate.fullName || selectedCandidate.username}
                  </p>
                  <p className="text-xs text-slate-500">{selectedCandidate.username}</p>
                </div>
              </div>

              {selectedCandidate.resume && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Resume
                  </p>
                  <a
                    href={getAssetUrl(selectedCandidate.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 text-[11px] font-bold uppercase tracking-widest border border-white/10"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exam Management Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20 mt-4">
        <div className="glass rounded-[2rem] p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Assessment Registry</h2>
              <p className="text-slate-500 text-sm font-light">Real-time status of proctored environments</p>
            </div>
            <button
              onClick={() => navigate('/admin/create-exam')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-100 font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2 group"
            >
              <span className="text-blue-400 group-hover:scale-125 transition-transform">+</span> Create New
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-light">
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 px-4 font-medium">
                        <div className="text-slate-100">{exam.title}</div>
                        <div className="text-[10px] text-slate-500 max-w-[200px] truncate">{exam.description}</div>
                      </td>
                      <td className="py-5 px-4 text-slate-400 font-mono-timer">{exam.duration}m</td>
                      <td className="py-5 px-4 text-slate-400 font-mono-timer">{exam.questions?.length || 0}</td>
                      <td className="py-5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${exam.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                          {exam.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              fetchExamSubmissions(exam._id);
                            }}
                            className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all border border-blue-500/20 uppercase tracking-widest"
                          >
                            Results
                          </button>
                          {!exam.isActive ? (
                            <button className="text-slate-500 hover:text-blue-400 font-bold text-[10px] p-2 transition-colors tracking-widest uppercase">
                              Edit
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest px-2 opacity-50 flex items-center">
                              LOCKED
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-slate-600 italic">
                      No environments deployed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
