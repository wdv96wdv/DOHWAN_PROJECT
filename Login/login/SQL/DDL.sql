-- PostgreSQL DDL

-- Users Table
CREATE TABLE users (
    no BIGSERIAL PRIMARY KEY,
    id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    provider VARCHAR(50) DEFAULT 'traditional'
);

-- Boards Table
CREATE TABLE boards (
    no BIGSERIAL PRIMARY KEY,
    id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    writer VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_no BIGINT,
    FOREIGN KEY (user_no) REFERENCES users(no) ON DELETE SET NULL
);

-- Comments Table
CREATE TABLE comments (
    no BIGSERIAL PRIMARY KEY,
    id VARCHAR(255) UNIQUE NOT NULL,
    board_id VARCHAR(255) NOT NULL,
    user_no BIGINT NOT NULL,
    writer VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_no) REFERENCES users(no) ON DELETE CASCADE
);

-- Files Table
CREATE TABLE files (
    no BIGSERIAL PRIMARY KEY,
    id VARCHAR(255) UNIQUE NOT NULL,
    p_table VARCHAR(255),
    p_no BIGINT,
    file_name VARCHAR(255),
    origin_name VARCHAR(255),
    file_path VARCHAR(255),
    file_size BIGINT,
    seq INT,
    type VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes from previous recommendations
CREATE INDEX idx_boards_created_at ON boards (created_at DESC);
CREATE INDEX idx_boards_user_no ON boards (user_no);
CREATE INDEX idx_files_p_no_p_table ON files (p_no, p_table);
CREATE INDEX idx_comment_board_id_created_at ON comments (board_id, created_at);

-- Marathons Table
CREATE TABLE IF NOT EXISTS marathons (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link TEXT,
    location VARCHAR(100),
    race_date DATE,
    start_date DATE,
    end_date DATE,
    type TEXT[],
    is_first_come BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_marathon UNIQUE (title, race_date)
);

-- RLS Policy for Marathons
-- Allow anyone to read
ALTER TABLE marathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON marathons;
CREATE POLICY "Allow public read access" ON marathons FOR SELECT TO public USING (true);

-- Allow anonymous upsert (Removed for security - maintenance via Service Role only)
DROP POLICY IF EXISTS "Allow anonymous upsert" ON marathons;

-- Nested Comments UPDATE (Run this manually on the database to apply)
ALTER TABLE comments ADD COLUMN parent_id VARCHAR(255) REFERENCES comments(id) ON DELETE CASCADE;

-- ==========================================
-- Security Hardening & RLS Implementation
-- ==========================================

-- [보안 강화] 모든 테이블 RLS 활성화 및 정책 설정
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marathons ENABLE ROW LEVEL SECURITY;

-- 마라톤 테이블 정책: 누구나 조회 가능, 수정 불가
DROP POLICY IF EXISTS "Allow public read access" ON public.marathons;
CREATE POLICY "Allow public read access" ON public.marathons 
FOR SELECT TO public 
USING (true);

-- 프로필 테이블 정책: 프론트엔드 연동을 위해 누구나 조회 가능
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
CREATE POLICY "Allow public read access" ON public.profiles 
FOR SELECT TO public 
USING (true);

-- 함수 보안: search_path 고정
ALTER FUNCTION public.delete_user_all_data SET search_path = public;
ALTER FUNCTION public.delete_user_data SET search_path = public;
ALTER FUNCTION public.handle_new_user SET search_path = public;
ALTER FUNCTION public.update_updated_at_column SET search_path = public;
