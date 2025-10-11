import api from './api';

//목록
export const list = (page, size) => api.get(`/boards?page=${page}&size=${size}`);
//조회
export const select = (id) => api.get(`/boards/${id}`);
//등록
export const insert = (data, headers) => api.post("/boards", data, headers);
//수정
export const update = (data, headers) => api.put("/boards", data, headers);
//삭제
export const remove = (id) => api.delete(`/boards/${id}`);
