import axios from "axios";
import { handleTokenRefresh } from "./auth-refresh";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// API client for vocab/lesson/folder/srs/history endpoints (/api/*)
export const vocabApiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// Attach JWT token
vocabApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally with auto-refresh
vocabApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      return handleTokenRefresh(originalRequest, vocabApiClient);
    }

    return Promise.reject(error);
  }
);

