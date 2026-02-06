import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Store token in memory
let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: any; reject: any }> = [];

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: allows cookies to be sent and received
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add access token to Authorization header
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Token refresh is in progress, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            if (accessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token using the refresh token in the httpOnly cookie
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        accessToken = response.data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        failedQueue.forEach(({ resolve }) => resolve(axiosInstance(originalRequest)));
        failedQueue = [];

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear token and redirect to login
        accessToken = null;
        failedQueue.forEach(({ reject }) => reject(refreshError));
        failedQueue = [];

        // Emit event for login page redirect (handled by AuthProvider)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Export function to set token (called by AuthProvider)
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Export function to get current token
export const getAccessToken = () => accessToken;

export default axiosInstance;
