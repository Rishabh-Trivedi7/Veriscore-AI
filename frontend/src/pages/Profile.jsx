import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../utils/api';

const Profile = () => {
  const { user, setUser } = useAuth(); // Need setUser to update local state
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

      // Update local user state
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
    <div className="min-h-screen bg-blue-50 text-blue-900">
      <header className="border-b border-blue-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-700 hover:text-blue-900"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wide text-blue-700">
              Profile
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm">
            {success}
          </div>
        )}

        <div className="bg-white border border-blue-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden relative group">
              {user.profilePicture ? (
                <img
                  src={getFullUrl(user.profilePicture)}
                  alt={user.fullName || user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-blue-700">
                  {(user.fullName || user.username || '?')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                  <span className="text-[10px] text-white font-semibold">Change</span>
                  <input type="file" name="profilePicture" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              )}
            </div>
            <p className="text-xs text-blue-800">
              Role: <span className="font-semibold">{user.role}</span>
            </p>
          </div>

          <div className="flex-1 space-y-4 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-semibold mb-1">
                  {user.fullName || user.username}
                </h1>
                <p className="text-blue-800 text-xs">
                  This information is visible only to you and recruiters on
                  VeriScore AI.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-700 uppercase">
                  Username
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    {user.username}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-700 uppercase">
                  Email
                </p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    {user.email}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-700 uppercase">
                  Full name
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                    {user.fullName || 'N/A'}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-700 uppercase">
                  Account created
                </p>
                <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-700 uppercase">
                Resume
              </p>
              <div className="flex items-center gap-3">
                {user.resume && (
                  <a
                    href={getFullUrl(user.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    View Current Resume
                  </a>
                )}
                {isEditing && (
                  <label className="cursor-pointer bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full text-xs hover:bg-blue-100 transition">
                    <span>{files.resume ? files.resume.name : 'Upload New Resume'}</span>
                    <input type="file" name="resume" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                  </label>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-blue-50">
                <button
                  disabled={loading}
                  onClick={handleSave}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: user.username,
                      email: user.email,
                      fullName: user.fullName || '',
                    });
                    setFiles({ profilePicture: null, resume: null });
                  }}
                  className="bg-blue-50 text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
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


