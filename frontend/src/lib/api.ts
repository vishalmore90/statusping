/**
 * API client for StatusPing backend.
 * Uses axios with automatic JWT token injection.
 */
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: inject Authorization header from localStorage
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: redirect to /login on 401 (except when already on auth routes)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: { response?: { status: number } }) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register")) {
        localStorage.removeItem("access_token");
        // Full-page reset for non-React axios interceptor
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);
