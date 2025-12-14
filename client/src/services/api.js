import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.detail ||
        error.response.data?.message ||
        error.message;
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(
        new Error(
          "Unable to connect to server. Please check if the backend is running."
        )
      );
    } else {
      return Promise.reject(error);
    }
  }
);

export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await api.post("/api/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getClasses = async () => {
  const response = await api.get("/api/classes");
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get("/api/health");
  return response.data;
};

export default api;
