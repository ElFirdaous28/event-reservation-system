import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Store token in memory
let accessToken: string | null = null;

// Create axios instance with base configuration
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`,

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

// Export function to set token (called by AuthProvider)
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Export function to get current token
export const getAccessToken = () => accessToken;

export default axiosInstance;
