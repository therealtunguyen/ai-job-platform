import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create(
  {
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
      Accept: "application/json"
    }
  }
)

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Try both token storage keys for compatibility
    const accessToken = localStorage.getItem("token") || localStorage.getItem("key");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Only set Content-Type to application/json if data is not FormData
    // When sending FormData, browser automatically sets the correct multipart Content-Type with boundary
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config
  },
  (error) => {
    return Promise.reject(error);
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        // Check if this is a token expiration error
        if (error.response.data?.error?.includes("expired") || 
            error.response.data?.error?.includes("Invalid or expired token")) {
          
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          // Try to refresh the token
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const response = await axios.post(`${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/api/auth/refresh`, {
                refreshToken: refreshToken
              });
              
              if (response.data.accessToken) {
                localStorage.setItem("token", response.data.accessToken);
                localStorage.setItem("key", response.data.accessToken);
                
                if (response.data.refreshToken) {
                  localStorage.setItem("refreshToken", response.data.refreshToken);
                }
                
                processQueue(null, response.data.accessToken);
                
                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return axiosInstance(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            processQueue(refreshError, null);
          } finally {
            isRefreshing = false;
          }
        }
        
        // If refresh failed or no refresh token, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("key");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
)

export default axiosInstance;