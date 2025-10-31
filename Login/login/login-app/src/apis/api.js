import axios from 'axios';

// 로컬 Spring Boot 서버 주소로 변경
//const API_BASE_URL = "http://localhost:8080";
//const API_BASE_URL = "https://dohwan-project.onrender.com";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axios 객체 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 8000 // 8초 타임아웃
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

// ✅ 응답 인터셉터: 네트워크/타임아웃 시 한정 재시도 (GET만)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const isGet = (config.method || '').toLowerCase() === 'get';
    const shouldRetry = isGet && (error.code === 'ECONNABORTED' || !error.response);
    if (!shouldRetry) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    const maxRetries = 2;
    if (config.__retryCount >= maxRetries) {
      return Promise.reject(error);
    }
    config.__retryCount += 1;
    const delay = 300 * Math.pow(2, config.__retryCount - 1);
    await new Promise((r) => setTimeout(r, delay));
    return api(config);
  }
);

export default api;
