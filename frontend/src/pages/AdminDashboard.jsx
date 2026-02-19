import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, submissionsRes, examsRes] = await Promise.all([
        api.get('/api/v1/admin/dashboard-stats'),
        api.get('/api/v1/admin/submissions'),
        api.get('/api/v1/admin/exams')
      ]);
      setStats(statsRes.data.data);
      setSubmissions(submissionsRes.data.data.submissions);
      setExams(examsRes.data.data.exams);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillRadarData = (report) => {
    if (!report) return [];
    return [
      { subject: 'Accuracy', A: report.score, fullMark: 100 },
      { subject: 'Consistency', A: report.trustScore, fullMark: 100 },
      { subject: 'Speed', A: Math.min(100, (60 / (report.timeSpent || 1)) * 10), fullMark: 100 },
      { subject: 'Criticality', A: 100 - (report.violationLogs?.length * 5 || 0), fullMark: 100 },
      { subject: 'Depth', A: (report.aiGrading?.score || 0) * 10, fullMark: 100 },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-blue-900 font-medium animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-black text-xl tracking-tight text-slate-900">VeriScore <span className="text-blue-600">Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/create-exam')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              + Create Exam
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
            <p className="text-4xl font-black text-slate-900">{stats?.totalSubmissions || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pass Rate</p>
            <p className="text-4xl font-black text-emerald-600">{stats?.passRate || 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Trust Score</p>
            <p className="text-4xl font-black text-blue-600">{stats?.avgTrustScore || 0}</p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-10">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Exam</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Score</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Trust</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-900">{sub.candidateId?.fullName || sub.candidateId?.username}</div>
                      <div className="text-xs text-slate-500">{sub.candidateId?.email}</div>
                    </td>
                    <td className="py-5 px-6 text-sm text-slate-600 font-medium">{sub.examId?.title}</td>
                    <td className="py-5 px-6 font-bold text-slate-800">{sub.score}%</td>
                    <td className="py-5 px-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${sub.trustScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {sub.trustScore}%
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="text-blue-600 hover:text-blue-800 font-black text-xs transition-colors"
                      >
                        VIEW REPORT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Modal Overlay */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">
              <div className="p-8 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Performance Audit</h3>
                  <p className="text-slate-500 text-sm">{selectedSubmission.candidateId?.fullName} · {selectedSubmission.examId?.title}</p>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-2xl">×</button>
              </div>

              <div className="p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Pass/Fail</p>
                    <p className={`text-xl font-bold ${selectedSubmission.score >= (selectedSubmission.examId?.passingScore || 0) ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedSubmission.score >= (selectedSubmission.examId?.passingScore || 0) ? 'PASSED' : 'FAILED'}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Score</p>
                    <p className="text-xl font-bold text-slate-800">{selectedSubmission.score}%</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Trust Score</p>
                    <p className={`text-xl font-bold ${selectedSubmission.trustScore > 80 ? 'text-emerald-600' : selectedSubmission.trustScore > 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {selectedSubmission.trustScore}%
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Spent</p>
                    <p className="text-xl font-bold text-slate-800">{selectedSubmission.timeSpent || 0}m</p>
                  </div>
                </div>

                {/* AI & Proctoring Intelligence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">AI</span>
                      Skill Evaluation
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getSkillRadarData(selectedSubmission)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <Radar name="Candidate" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded flex items-center justify-center text-xs">!</span>
                      Violation Logs
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 text-left">
                      {selectedSubmission.violationLogs?.length > 0 ? (
                        selectedSubmission.violationLogs.map((log, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm leading-tight">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                                {log.type}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-slate-600">{log.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm italic">No violations recorded. Candidate followed all protocols.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="mb-8">
                  <h4 className="font-bold text-slate-900 mb-4">AI Analysis Summary</h4>
                  <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-slate-700 leading-relaxed italic">
                      "{selectedSubmission.aiGrading?.summary || 'No AI summary available for this submission.'}"
                    </p>
                    {selectedSubmission.aiGrading?.gaps?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedSubmission.aiGrading.gaps.map((gap, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-full">
                            Gap: {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Answers Table */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Detailed Technical Responses</h4>
                  <div className="space-y-4">
                    {selectedSubmission.answers && Object.entries(selectedSubmission.answers).map(([key, value]) => (
                      <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Question {parseInt(key) + 1}</div>
                        <p className="text-slate-800 text-sm whitespace-pre-wrap">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Exam Management Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20 mt-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Assessments</h2>
              <p className="text-slate-500 text-sm">Manage and monitor your created exams</p>
            </div>
            <button
              onClick={() => navigate('/admin/create-exam')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              <span>+</span> Create New
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Title</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Questions</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-4">
                        <div className="font-bold text-slate-900">{exam.title}</div>
                        <div className="text-xs text-slate-500 max-w-[200px] truncate">{exam.description}</div>
                      </td>
                      <td className="py-5 px-4 text-sm text-slate-600 font-medium">{exam.duration}m</td>
                      <td className="py-5 px-4 text-sm text-slate-600 font-medium">{exam.questions?.length || 0} items</td>
                      <td className="py-5 px-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${exam.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {exam.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <button className="text-slate-400 hover:text-blue-600 font-bold text-xs p-2 transition-colors">
                          EDIT
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                      No exams found. Click "Create New" to get started.
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
