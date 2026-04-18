
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__ 
  ? 'http://10.191.121.196:3000/api'
  // ? 'https://hypophyllous-brutal-dusty.ngrok-free.dev/api'    
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log('🚀 API Request:', config.method.toUpperCase(), config.baseURL + config.url);
    console.log('📦 Data:', config.data);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error
      console.log('❌ Server Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.log('❌ No Response - Backend might be down');
      console.log('🔍 Trying to reach:', API_URL);
      console.log('💡 Make sure backend is running: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
    }
    
    return Promise.reject(error);
  }
);

export default api;