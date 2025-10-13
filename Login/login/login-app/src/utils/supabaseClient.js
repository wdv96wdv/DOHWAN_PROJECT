// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co';  // Supabase 프로젝트 URL
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';  // 공개 API 키

console.log("supabaseUrl = " + supabaseUrl);
console.log("supabaseKey = " + supabaseKey); 

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
