-- Run this file AFTER the Users table has been created (Member A's responsibility).
-- Usage: mysql -u root -p community_platform < database/posts.sql


CREATE TABLE IF NOT EXISTS posts (
    post_id    INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP

    -- FOREIGN KEY (user_id)
    --     REFERENCES Users(user_id)
    --     ON DELETE SET NULL-- post survives even if user is deleted   
);
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    anonymous_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);  
