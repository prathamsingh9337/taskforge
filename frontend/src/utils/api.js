import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('taskforge_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// If token expires, log out automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskforge_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
