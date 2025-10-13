import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co'; // Supabase URL
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd'; // API Key

consoel.log("supabaseUrl = " + supabaseUrl);
console.log("supabaseKey = " + supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey); // Supabase 클라이언트 생성

// 파일 업로드 함수
export const uploadFile = async (file, folder) => {
  try {
    // Supabase Storage에서 지정된 폴더에 파일 업로드
    const { data, error } = await supabase.storage
      .from(folder)  // 폴더 지정
      .upload(file.name, file);  // 업로드할 파일과 파일 이름

    if (error) {
        console.error('업로드 실패:', error);
      throw error;
    }
    console.log('파일 업로드 성공:', data);
    // 업로드 성공 시 파일 경로 반환
    return data;
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    throw error;
  }
};

export default supabase;
