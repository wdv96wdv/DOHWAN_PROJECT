import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co'; // Supabase URL
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd'; // API Key

console.log("supabaseUrl = " + supabaseUrl);
console.log("supabaseKey = " + supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey); // Supabase 클라이언트 생성

// 파일 업로드 함수
export const uploadFile = async (file, folder) => {
  try {
    const fileName = `${crypto.randomUUID()}_${file.name}`;  // 파일 이름에 고유값 추가
    const { data, error } = await supabase.storage
      .from('upload') // 폴더 지정
      .upload(`${folder}/${fileName}`, file);  // 폴더 이름과 파일 경로 지정

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
