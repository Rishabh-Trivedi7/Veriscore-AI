import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../utils/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
  });

  const [files, setFiles] = useState({
    profilePicture: null,
    resume: null,
  });

  if (!user) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFiles((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('fullName', formData.fullName);

      if (files.profilePicture) {
        data.append('profilePicture', files.profilePicture);
      }
      if (files.resume) {
        data.append('resume', files.resume);
      }

      const response = await api.patch('/api/v1/auth/update-profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      {/* Header */}
      <header className="glass border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">
              Profile
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary text-xs px-4 py-2"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
            {success}
          </div>
        )}

        <div className="glass rounded-2xl p-8 flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative group">
              {user.profilePicture ? (
                <img
                  src={getFullUrl(user.profilePicture)}
                  alt={user.fullName || user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-blue-400">
                  {(user.fullName || user.username || '?')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
                  <span className="text-[10px] text-white font-semibold">Change</span>
                  <input type="file" name="profilePicture" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-300">{user.role}</span>
            </p>
          </div>

          {/* Form */}
          <div className="flex-1 space-y-5 text-sm">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-100 mb-1">
                {user.fullName || user.username}
              </h1>
              <p className="text-slate-500 text-xs">
                This information is visible only to you and recruiters on VeriScore AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Username</p>
                {isEditing ? (
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="input-dark text-sm" />
                ) : (
                  <p className="rounded-xl bg-slate-800/50 border border-slate-700/40 px-4 py-2.5 text-slate-200">{user.username}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
                {isEditing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-dark text-sm" />
                ) : (
                  <p className="rounded-xl bg-slate-800/50 border border-slate-700/40 px-4 py-2.5 text-slate-200">{user.email}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full name</p>
                {isEditing ? (
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="input-dark text-sm" />
                ) : (
                  <p className="rounded-xl bg-slate-800/50 border border-slate-700/40 px-4 py-2.5 text-slate-200">{user.fullName || 'N/A'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account created</p>
                <p className="rounded-xl bg-slate-800/50 border border-slate-700/40 px-4 py-2.5 text-slate-200">
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Resume */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Resume</p>
              <div className="flex items-center gap-3">
                {user.resume && (
                  <a
                    href={getFullUrl(user.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    View Resume
                  </a>
                )}
                {isEditing && (
                  <label className="cursor-pointer bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                    <span>{files.resume ? files.resume.name : 'Upload New Resume'}</span>
                    <input type="file" name="resume" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  disabled={loading}
                  onClick={handleSave}
                  className="btn-primary"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ username: user.username, email: user.email, fullName: user.fullName || '' });
                    setFiles({ profilePicture: null, resume: null });
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
