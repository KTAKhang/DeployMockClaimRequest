import axios from "axios";

const API_BASE_URL = "https://ojtbe-production.up.railway.app/api";

// ✅ Create a custom Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Interceptor to automatically attach the token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle global errors (Preserve full response)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response || error); // Keep full response
  }
);

export default apiClient;
