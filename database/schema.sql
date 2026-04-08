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