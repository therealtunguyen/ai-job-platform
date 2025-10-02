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

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("key");
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
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
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