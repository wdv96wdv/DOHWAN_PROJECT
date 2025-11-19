CREATE TABLE wishlist (
    wishlist_id BIGSERIAL PRIMARY KEY,
    user_no BIGINT NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(1024),
    image VARCHAR(1024),
    lprice INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_no) REFERENCES users(no) ON DELETE CASCADE,
    UNIQUE (user_no, product_id)
);
