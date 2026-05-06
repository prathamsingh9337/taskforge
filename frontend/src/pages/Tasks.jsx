import { useState, useEffect } from 'react';
import api from '../utils/api';

const statusColors = {
  'todo': 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'done': 'bg-green-100 text-green-700'
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks/my');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date() > new Date(task.dueDate);
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'overdue') return isOverdue(t);
    if (filter === 'done') return t.status === 'done';
    if (filter === 'active') return t.status !== 'done';
    return true;
  });

  if (loading) return <div className="text-gray-400 text-sm">Loading tasks...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-gray-500 text-sm mt-1">All tasks assigned to you</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'active', 'overdue', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No tasks here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {filtered.map((task) => (
            <div
              key={task._id}
              className={`flex items-center justify-between px-5 py-4 ${
                isOverdue(task) ? 'bg-red-50' : ''
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${isOverdue(task) ? 'text-red-700' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {isOverdue(task) && (
                    <span className="text-xs text-red-500 bg-red-100 px-1.5 py-0.5 rounded">Overdue</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">{task.project?.name}</span>
                  {task.dueDate && (
                    <span className={`text-xs ${isOverdue(task) ? 'text-red-500' : 'text-gray-400'}`}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                  className={`text-xs border-0 rounded-full px-3 py-1.5 font-medium focus:outline-none cursor-pointer ${statusColors[task.status]}`}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
