import axios from "axios";
import supabase from "../utils/supabaseClient";

// 로컬
// 업로드
export const upload = (data, headers) => axios.post(`/api/files`, data, headers)

// 다운로드
export const download = (id) => axios.get(`/api/files/download/${id}`, { responseType: 'blob' })

// 파일 삭제
export const remove = (id) => axios.delete(`/api/files/${id}`)

// 파일 선택 삭제
export const removeFiles = (idList) => axios.delete(`/api/files?idList=${idList}`)

// 타입별 파일 목록
export const fileByType = (pTable, pNo, type) => axios.get(`/api/files/${pTable}/${pNo}/?type=${type}`)


// 운영
// 파일 업로드 함수
export const uploadFileToSupabase = async (file, folder) => {
  const fileName = `${folder}/${Date.now()}-${file.name}`; // 파일 이름에 타임스탬프 추가


  // Supabase Storage에 파일 업로드
  const { data, error } = await supabase.storage
    .from('upload') // 'upload'는 Supabase에서 만든 버킷 이름
    .upload(fileName, file);

  if (error) {
    console.error('파일 업로드 실패:', error);
    throw new Error('파일 업로드 실패: ' + error.message);
  }
  // 업로드 성공 후 파일의 URL 반환
  const fileUrl = `https://ismclnqslxnlsfmqjytc.supabase.co/storage/v1/object/public/upload/${fileName}`;
  return fileUrl;  // 파일 URL 반환
};

// 파일 다운로드 함수
export const downloadFileFromSupabase = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from('upload')
      .download(filePath)

    if (error) {
      console.error('Supabase 다운로드 에러:', error)
      throw new Error(error.message || '알 수 없는 다운로드 오류')
    }

    return data
  } catch (err) {
    console.error('downloadFileFromSupabase 예외:', err)
    throw err
  }
}

// 단일 파일 삭제
export const deleteFileFromSupabase = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from('upload') // 버킷 이름
      .remove([filePath]); // 배열 형태로 파일 경로 전달

    if (error) {
      console.error('Supabase 파일 삭제 실패:', error);
      throw new Error(error.message || '파일 삭제 실패');
    }

    return data; // 삭제 성공
  } catch (err) {
    console.error('deleteFileFromSupabase 예외:', err);
    throw err;
  }
};

// 여러 파일 삭제
export const deleteMultipleFilesFromSupabase = async (filePaths) => {
  if (!filePaths || filePaths.length === 0) return;

  try {
    const { data, error } = await supabase.storage
      .from('upload')
      .remove(filePaths); // 배열 그대로 전달

    if (error) {
      console.error('Supabase 다중 파일 삭제 실패:', error);
      throw new Error(error.message || '파일 삭제 실패');
    }

    return data; // 삭제 성공
  } catch (err) {
    console.error('deleteMultipleFilesFromSupabase 예외:', err);
    throw err;
  }
};
