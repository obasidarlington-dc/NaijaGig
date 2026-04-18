import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.191.121.196:3000/api', // my backend IP
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;