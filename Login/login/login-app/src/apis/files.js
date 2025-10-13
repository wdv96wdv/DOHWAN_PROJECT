import axios from "axios";
import supabase from "../utils/supabaseClient";

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
    const fileUrl = `https://ismclnqslxnlsfmqjytc.supabase.co/storage/v1/object/public/${data.path}`;

    // URL을 백엔드로 전송
    await axios.post('/your-api-endpoint', {
      files: [fileUrl],  // 파일 URL 배열로 보내기
    });

    return fileUrl;  // 파일 URL 반환

  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
