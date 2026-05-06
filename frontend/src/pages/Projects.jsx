import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '', members: [] });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId]
    }));
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading projects...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No projects yet.</p>
          {user?.role === 'admin' && (
            <p className="text-gray-400 text-sm mt-1">Create one to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-gray-300 hover:text-red-500 text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 mb-3">{project.description}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      title={m.name}
                      className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                    >
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <Link
                  to={`/projects/${project._id}`}
                  className="text-sm text-gray-900 font-medium hover:underline"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create project modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g. Website Redesign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  rows={2}
                  placeholder="What's this project about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                <div className="space-y-1 max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {users.map((u) => (
                    <label key={u._id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                      <input
                        type="checkbox"
                        checked={form.members.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                      />
                      {u.name}
                      <span className="text-xs text-gray-400">{u.email}</span>
                    </label>
                  ))}
                  {users.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No other users yet</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
