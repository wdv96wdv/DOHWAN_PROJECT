import axios from 'axios';

const API_BASE_URL = "https://dohwan-project.onrender.com";
// axios 객체 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  });

// ✅ 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
