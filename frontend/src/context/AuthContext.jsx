import { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('taskforge_user') || 'null')
  );

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('taskforge_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('taskforge_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('taskforge_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
