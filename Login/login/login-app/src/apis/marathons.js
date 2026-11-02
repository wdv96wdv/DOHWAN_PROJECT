import api from './api';

// 관리자 전용 마라톤 일정 API (JWT는 api 인터셉터가 자동으로 붙여준다)

// 전체 목록 (지난 대회 포함)
export const adminList = () => api.get('/admin/marathons');

// 등록
export const adminCreate = (payload) => api.post('/admin/marathons', payload);

// 수정
export const adminUpdate = (id, payload) => api.put(`/admin/marathons/${id}`, payload);

// 삭제
export const adminRemove = (id) => api.delete(`/admin/marathons/${id}`);
