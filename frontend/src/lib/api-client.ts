import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
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

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
          try {
            const response = await axios.post(
              `${API_URL}/api/v1/auth/refresh-token`,
              { refreshToken }
            );
            const { access_token } = response.data;
            localStorage.setItem("access_token", access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return apiClient(originalRequest);
          } catch {
            // Refresh failed — clear tokens
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/auth/login";
          }
        } else {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);
