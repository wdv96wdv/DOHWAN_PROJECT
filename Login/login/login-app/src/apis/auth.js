import api from './api';

// 회원가입
export const join = (data) => api.post(`/users`, data)

// 로그인
export const login = async (username, password) => {
  try {
    const response = await api.post(`/login`, { username, password });

    // Authorization 헤더에서 JWT 추출
    const authorization = response.headers['authorization'];
    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      localStorage.setItem('jwt', token);
      console.log('✅ JWT 저장 완료:', token);
    } else {
      console.warn('⚠️ Authorization 헤더 없음:', response.headers);
    }

    return response;
  } catch (error) {
    console.error('❌ 로그인 실패:', error);
    throw error;
  }
};

// 회원 정보
export const info = () => api.get(`/users/info`)

// 회원 정보 수정
export const update = (data) => api.put(`/users`, data)

// 회원 탈퇴
export const remove = (username) => api.delete(`/users/${username}`)