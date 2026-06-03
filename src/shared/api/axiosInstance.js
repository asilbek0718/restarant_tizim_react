import axios from 'axios';
import useAuthStore from '@/store/auth/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.restoran.uz/v1';

/**
 * Enterprise Axios Instance
 * Features:
 * 1. Automatic Token Injection
 * 2. Professional Refresh Token Flow
 * 3. Request Queueing (Prevent Race Conditions)
 * 4. Response Normalization
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Refresh & Errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { response, config } = error;

    // Handle 401 Unauthorized (Expired Token)
    if (response?.status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => { 
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            config.headers.Authorization = `Bearer ${token}`;
            return api(config);
          })
          .catch(err => Promise.reject(err));
      }

      config._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefreshToken, user, expiresIn } = res.data;
        
        useAuthStore.getState().login(user, token, newRefreshToken, expiresIn);
        
        processQueue(null, token);
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;
