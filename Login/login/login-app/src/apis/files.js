import axios from "axios";
import supabase  from "../utils/supabaseClient"; 

// // 업로드
// export const upload = (data, headers) => axios.post(`/files`, data, headers)

// // 다운로드
// export const download = (id) => axios.get(`/files/download/${id}`, {responseType: 'bolb'})

// // 파일 삭제
// export const remove = (id) => axios.delete(`/files/${id}`)

// // 파일 선택 삭제
// export const removeFiles = (idList) => axios.delete(`/files?idList=${idList}`)

// // 타입별 파일 목록
// export const fileByType = (pTable, pNo, type) => axios.get(`/files/${pTable}/${pNo}/?type=${type}`)

// 파일 업로드 함수
export const uploadFileToSupabase = async (file, folder) => {
const fileName = `${folder}/${Date.now()}-${file.name}`; // 파일 이름에 타임스탬프 추가


   // Supabase Storage에 파일 업로드
  const { data, error } = await supabase.storage
    .from('upload') // 'upload'는 Supabase에서 만든 버킷 이름
    .upload(fileName, file);

  if (error) {
    throw new Error('파일 업로드 실패: ' + error.message);
  }
    // 업로드 성공 후 파일의 URL 반환
     const fileUrl = `https://<supabase-url>.supabase.co/storage/v1/object/public/upload/${fileName}`;
    return fileUrl;  // 파일 URL 반환
};