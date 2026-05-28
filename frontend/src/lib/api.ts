import axios from 'axios';
import NProgress from 'nprogress';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
console.log('API_URL em tempo de execução:', API_URL);
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
let activeRequests = 0
let progressTimer: number | null = null

const startProgress = () => {
  if (progressTimer) return
  // delay to avoid flicker for very fast calls
  progressTimer = window.setTimeout(() => {
    NProgress.start()
  }, 150)
}

const doneProgress = () => {
  if (progressTimer) {
    window.clearTimeout(progressTimer)
    progressTimer = null
  }
  if (activeRequests <= 0) {
    NProgress.done()
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  activeRequests += 1
  startProgress()
  return config;
});

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => {
    activeRequests -= 1
    doneProgress()
    return response
  },
  (error) => {
    activeRequests -= 1
    doneProgress()
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
