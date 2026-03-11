import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = formData.identifier.trim();
      const isEmail = identifier.includes('@');

      const payload = {
        username: isEmail ? '' : identifier,
        email: isEmail ? identifier : '',
        password: formData.password,
      };

      const user = await login(payload);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-blue-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-emerald-500/8 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-2xl p-8 hover:scale-[1.01] transition-transform duration-300">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 via-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              VS
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-center mb-1 text-slate-100">
            Welcome back
          </h1>
          <p className="text-center text-slate-500 text-sm mb-8">
            Sign in to your AI‑proctored assessment workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Username or Email
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                className="input-dark"
                placeholder="Enter username or email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-dark"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
