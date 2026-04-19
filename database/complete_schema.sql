-- Complete Database Schema for Community Discussion Platform
-- Drop existing database if exists and create fresh
DROP DATABASE IF EXISTS cdp;
CREATE DATABASE cdp;
USE cdp;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    anonymous_name VARCHAR(100),
    bio TEXT,
    avatar_color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- ============================================
-- GROUPS/COMMUNITIES TABLE
-- ============================================
CREATE TABLE groups_table (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    creator_id INT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_creator (creator_id)
);

-- ============================================
-- GROUP MEMBERS TABLE
-- ============================================
CREATE TABLE group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups_table(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id),
    INDEX idx_group (group_id),
    INDEX idx_user (user_id)
);

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    group_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES groups_table(group_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_group (group_id),
    INDEX idx_created (created_at)
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT,
    content TEXT NOT NULL,
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id),
    INDEX idx_created (created_at)
);

-- ============================================
-- VOTES TABLE
-- ============================================
CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    vote_type ENUM('UPVOTE', 'DOWNVOTE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (user_id, post_id),
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
);

-- ============================================
-- SEED DATA FOR TESTING
-- ============================================

-- Create a test user
INSERT INTO users (username, email, password_hash, anonymous_name) 
VALUES ('testuser', 'test@cdp.com', '$2b$10$rK5qZ5qZ5qZ5qZ5qZ5qZ5uXxYxYxYxYxYxYxYxYxYxYxYxYxYxY', 'AnonUser1');

-- Create some default groups
INSERT INTO groups_table (name, description, creator_id, is_private) 
VALUES 
    ('General Discussion', 'Talk about anything and everything', 1, FALSE),
    ('Tech Talk', 'Discuss technology, programming, and innovation', 1, FALSE),
    ('Campus Life', 'Share experiences about campus activities', 1, FALSE),
    ('Study Groups', 'Academic discussions and study tips', 1, FALSE);

-- Add creator to their groups as admin
INSERT INTO group_members (group_id, user_id, role) 
VALUES 
    (1, 1, 'admin'),
    (2, 1, 'admin'),
    (3, 1, 'admin'),
    (4, 1, 'admin');

-- Create some sample posts
INSERT INTO posts (user_id, group_id, title, content) 
VALUES 
    (1, 1, 'Welcome to CDP!', 'This is the first post on our community discussion platform. Feel free to share your thoughts!'),
    (1, 2, 'What programming language should I learn?', 'I am new to programming and wondering which language to start with. Any suggestions?'),
    (1, 3, 'Best spots on campus', 'Where do you like to hang out between classes?');
