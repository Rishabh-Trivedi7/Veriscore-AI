import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'Candidate',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      if (profilePicture) {
        payload.append('profilePicture', profilePicture);
      }
      if (resume) {
        payload.append('resume', resume);
      }

      await register(payload);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message ||
                          'Registration failed. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4 py-12 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-blue-500/8 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 via-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              VS
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-center mb-1 text-slate-100">
            Create Account
          </h1>
          <p className="text-center text-slate-500 text-sm mb-8">
            Join VeriScore AI and unlock AI‑powered assessments
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input-dark"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-dark"
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-dark"
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-dark"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0] || null)}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:transition-colors file:cursor-pointer"
              />
              <p className="mt-1 text-xs text-slate-500">Clear headshot (PNG/JPG, max 5 MB)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Resume</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                onChange={(e) => setResume(e.target.files[0] || null)}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:transition-colors file:cursor-pointer"
              />
              <p className="mt-1 text-xs text-slate-500">PDF or Word, max 5 MB</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-dark"
              >
                <option value="Candidate">Candidate</option>
                <option value="Admin">Recruiter / Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
