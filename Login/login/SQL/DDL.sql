-- PostgreSQL DDL

-- Users Table
CREATE TABLE users (
    no BIGSERIAL PRIMARY KEY,
    id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
