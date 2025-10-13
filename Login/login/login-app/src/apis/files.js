import axios from "axios";
import supabase from "../utils/supabaseClient";

// 업로드
export const upload = (data, headers) => axios.post(`/files`, data, headers)

// 다운로드
export const download = (id) => axios.get(`/files/download/${id}`, {responseType: 'bolb'})

// 파일 삭제
export const remove = (id) => axios.delete(`/files/${id}`)

// 파일 선택 삭제
export const removeFiles = (idList) => axios.delete(`/files?idList=${idList}`)

// 타입별 파일 목록
export const fileByType = (pTable, pNo, type) => axios.get(`/files/${pTable}/${pNo}/?type=${type}`)

// 파일 업로드 함수
export const uploadFileToSupabase = async (file, fileType) => {
  try {
    const { data, error } = await supabase.storage
      .from('upload')  // 'upload' 버킷에 파일을 저장
      .upload(`files/${fileType}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: false,  // 이미 파일이 있을 경우 덮어쓰지 않음
      });

    if (error) throw error;

    // 업로드 성공 후 파일의 URL 반환
    return `https://ismclnqslxnlsfmqjytc.supabase.co/storage/v1/object/public/${data.path}`;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};