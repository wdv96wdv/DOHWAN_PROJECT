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
    provider VARCHAR(50) DEFAULT 'traditional',
    avatar_url TEXT,
    bio TEXT
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
    type VARCHAR(50) DEFAULT '전체',
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
    parent_id VARCHAR(255) REFERENCES comments(id) ON DELETE CASCADE,
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

-- User Auth Table
CREATE TABLE user_auth (
    no BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL
);

-- Records Table
CREATE TABLE IF NOT EXISTS records (
    no BIGSERIAL PRIMARY KEY,
    id VARCHAR(255) UNIQUE NOT NULL,
    running_name VARCHAR(255) NOT NULL,
    distance_km DOUBLE PRECISION,
    pace_min_per_km INTEGER,
    cadence INTEGER,
    duration_sec INTEGER,
    speed_kmh DOUBLE PRECISION,
    calories INTEGER,
    note VARCHAR(255),
    record_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    user_no BIGINT REFERENCES users(no) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_boards_created_at ON boards (created_at DESC);
CREATE INDEX idx_boards_user_no ON boards (user_no);
CREATE INDEX idx_files_p_no_p_table ON files (p_no, p_table);
CREATE INDEX idx_comment_board_id_created_at ON comments (board_id, created_at);

-- RLS Settings
ALTER TABLE marathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON marathons FOR SELECT TO public USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
