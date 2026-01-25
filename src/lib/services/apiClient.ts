import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to clear all auth state
const clearAuthState = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.clear();

  // Clear Zustand persisted state
  try {
    localStorage.removeItem("auth-store");
  } catch (e) {
    console.error("Failed to clear auth store:", e);
  }
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          // Send refresh token in Authorization header as Bearer token
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { token } = response.data;
          localStorage.setItem("authToken", token);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } else {
          // No refresh token available, redirect to login
          throw new Error("No refresh token available");
        }
      } catch (refreshError) {
        // Refresh failed, clear all auth state and redirect to login
        clearAuthState();

        // Redirect to correct login path
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API call function
export async function apiCall<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status || 500;
      throw new Error(`API Error (${status}): ${message}`);
    }
    throw error;
  }
}
