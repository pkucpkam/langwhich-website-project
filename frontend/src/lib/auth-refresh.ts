import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Centrally handles JWT token refresh with queueing for concurrent requests.
 * 
 * @param originalRequestConfig The Axios request config that failed with 401 and needs retry
 * @param axiosInstance The Axios instance to use for retrying the request
 */
export async function handleTokenRefresh(
  originalRequestConfig: any,
  axiosInstance: any
): Promise<any> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequestConfig.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequestConfig);
      })
      .catch((err) => Promise.reject(err));
  }

  isRefreshing = true;

  if (typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      try {
        // Call backend refresh endpoint directly using raw axios to avoid interceptor recursion
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
          refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Update Zustand store and localStorage
        useAuthStore.getState().updateTokens(access_token, refresh_token);

        // Process all queued requests with the new access token
        processQueue(null, access_token);

        // Retry the original request
        originalRequestConfig.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequestConfig);
      } catch (refreshError) {
        // If refresh fails, reject all queued requests and clear authentication
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  }

  // No refresh token available, clear auth and redirect
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
  return Promise.reject(new Error("No refresh token available"));
}
