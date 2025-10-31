import api from './api';

// 댓글 목록 조회
export const list = (boardId) => api.get(`/boards/${boardId}/comments`);

// 댓글 작성
export const create = (boardId, data) => api.post(`/boards/${boardId}/comments`, data);

// 댓글 수정
export const update = (boardId, commentId, data) => api.put(`/boards/${boardId}/comments/${commentId}`, data);

// 댓글 삭제
export const remove = (boardId, commentId, data) => api.delete(`/boards/${boardId}/comments/${commentId}`, { data });

