import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co'; // Supabase URL
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd'; // API Key
const supabase = createClient(supabaseUrl, supabaseKey); // Supabase 클라이언트 생성

export default supabase;
