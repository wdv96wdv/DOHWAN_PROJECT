import axios from 'axios';
axios.defaults.baseURL = "https://dohwan-project.onrender.com/api";

//목록
export const list = (page, size) => axios.get(`/boards?page=${page}&size=${size}`);
//조회
export const select = (id) => axios.get(`/boards/${id}`);
//등록
export const insert = (data, headers) => axios.post("/boards", data, headers);
//수정
export const update = (data, headers) => axios.put("/boards", data, headers);
//삭제
export const remove = (id) => axios.delete(`/boards/${id}`);
