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
        const res = await api.get('/api/v1/exam/list'); // New route for listing active exams
        setExams(res.data.data.exams);
      } catch (err) {
        if (err.response?.status === 404) {
          setExam(null);
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

  const handleStartExam = () => {
    navigate('/exam');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900">
      <header className="border-b border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-400 to-emerald-400 flex items-center justify-center text-white text-sm font-semibold">
              VS
            </div>
            <div>
              <p className="font-semibold tracking-tight">VeriScore AI</p>
              <p className="text-xs text-blue-700">Candidate Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={handleViewProfile}
              className="rounded-full border border-blue-200 px-4 py-1.5 text-blue-800 hover:bg-blue-100"
            >
              View profile
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-white font-semibold hover:bg-emerald-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">
            Welcome, {user?.fullName || user?.username}
          </h1>
          <p className="text-sm text-blue-800">
            Here are the exams available for you. When you start, AI proctoring
            and timed mode will begin.
          </p>
        </section>

        {loading && (
          <div className="rounded-2xl bg-white border border-blue-100 p-6 text-sm">
            Loading available exams…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (!exams || exams.length === 0) && (
          <div className="rounded-2xl bg-white border border-blue-100 p-6 text-sm">
            <p className="font-semibold mb-1">No active exams right now</p>
            <p className="text-blue-800">
              Your recruiter or admin hasn’t activated an exam yet. Check back
              later.
            </p>
          </div>
        )}

        {!loading && !error && exams && exams.map((exam) => (
          <div key={exam._id} className="rounded-2xl bg-white border border-blue-100 p-6 mb-4 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">{exam.title}</h2>
                <p className="text-sm text-blue-800 mb-1">{exam.description}</p>
                <p className="text-xs text-blue-700">
                  Duration: {exam.duration} minutes · Passing score:{' '}
                  {exam.passingScore}%
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 text-sm">
                <p className="text-blue-800">
                  Questions: {exam.questions?.length || 0}
                </p>
                <button
                  onClick={() => navigate(`/exam/${exam._id}`)} // Updated to include ID
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Start exam
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default CandidateDashboard;

