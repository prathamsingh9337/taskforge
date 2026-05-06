import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">TaskForge</h1>
          <p className="text-xs text-gray-400 mt-1">{user?.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
            user?.role === 'admin' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}>
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            📁 Projects
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            ✅ My Tasks
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
