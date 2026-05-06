import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  'todo': 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'done': 'bg-green-100 text-green-700'
};

const priorityColors = {
  'low': 'text-gray-400',
  'medium': 'text-yellow-500',
  'high': 'text-red-500'
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
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
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
    if (user?.role === 'admin') fetchUsers();
  }, [id]);

  const openCreateModal = () => {
    setEditTask(null);
    setForm({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, { ...form, project: id });
      } else {
        await api.post('/tasks', { ...form, project: id });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date() > new Date(task.dueDate);
  };

  const isMyTask = (task) => task.assignedTo?._id === user?._id;

  if (loading) return <div className="text-gray-400 text-sm">Loading project...</div>;
  if (!project) return <div className="text-gray-400 text-sm">Project not found.</div>;

  const grouped = {
    'todo': tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'done': tasks.filter(t => t.status === 'done')
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
          {project.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">Members:</span>
            {project.members.map((m) => (
              <span key={m._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {m.name}
              </span>
            ))}
          </div>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={openCreateModal}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Kanban-style columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(grouped).map(([status, statusTasks]) => (
          <div key={status} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </h3>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                {statusTasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {statusTasks.map((task) => (
                <div
                  key={task._id}
                  className={`bg-white rounded-lg border p-3 ${
                    isOverdue(task) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${isOverdue(task) ? 'text-red-700' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    <span className={`text-xs ${priorityColors[task.priority]}`} title={`${task.priority} priority`}>
                      {task.priority === 'high' ? '↑' : task.priority === 'low' ? '↓' : '–'}
                    </span>
                  </div>

                  {task.assignedTo && (
                    <p className="text-xs text-gray-400 mt-1">👤 {task.assignedTo.name}</p>
                  )}

                  {task.dueDate && (
                    <p className={`text-xs mt-0.5 ${isOverdue(task) ? 'text-red-500' : 'text-gray-400'}`}>
                      {isOverdue(task) ? '⚠ ' : ''}Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {/* Status dropdown — admin can change any, member can only change their own */}
                    {(user?.role === 'admin' || isMyTask(task)) && (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 focus:outline-none"
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    )}

                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {statusTasks.length === 0 && (
                <div className="text-center py-4 text-gray-300 text-xs">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task create/edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g. Design homepage mockup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">-- Unassigned --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
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
                  {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
