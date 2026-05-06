import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/tasks/stats/dashboard'),
          api.get('/tasks/my')
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading dashboard...</div>;
  }

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date() > new Date(task.dueDate);
  };

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-blue-100 text-blue-700',
    'done': 'bg-green-100 text-green-700'
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Hey, {user?.name.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's going on with your projects</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={stats?.total ?? 0} color="text-gray-900" />
        <StatCard label="Completed" value={stats?.completed ?? 0} color="text-green-600" />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} color="text-red-600" />
        <StatCard label="Assigned to Me" value={stats?.assignedToMe ?? 0} color="text-blue-600" />
      </div>

      {/* My tasks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">My Tasks</h3>
        </div>

        {recentTasks.length === 0 ? (
          <div className="p-5 text-center text-gray-400 text-sm">
            No tasks assigned to you yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentTasks.map((task) => (
              <div
                key={task._id}
                className={`flex items-center justify-between px-5 py-3 ${
                  isOverdue(task) ? 'bg-red-50' : ''
                }`}
              >
                <div>
                  <p className={`text-sm font-medium ${isOverdue(task) ? 'text-red-700' : 'text-gray-800'}`}>
                    {task.title}
                    {isOverdue(task) && (
                      <span className="ml-2 text-xs text-red-500">⚠ Overdue</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {task.project?.name} {task.dueDate && `· Due ${new Date(task.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
