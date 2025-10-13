import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co'; // Supabase URL
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd'; // API Key

consoel.log("supabaseUrl = " + supabaseUrl);
console.log("supabaseKey = " + supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey); // Supabase 클라이언트 생성

// utils/supabaseClients.js
export const uploadFile = async (file, folder) => {
  const fileName = `${Date.now()}_${file.name}`;  // 고유한 파일 이름을 생성
  const { data, error } = await supabase.storage
    .from(folder)
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  // 업로드된 파일의 public URL을 반환
  const fileUrl = `https://ismclnqslxnlsfmqjytc.supabase.co/storage/v1/object/public/${folder}/${fileName}`;
  return { path: fileUrl };  // URL을 path로 반환
};

export default supabase;
