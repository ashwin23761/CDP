# CDP - Community Discussion Platform

## Original Problem Statement
Build a Community Discussion Platform (CDP) - a pseudo-anonymous web app for campus environments. Node.js + Express backend, MySQL database, React + Vite frontend following PDF specifications.

## Architecture
- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4
- **Backend**: Node.js + Express.js 5
- **Database**: MariaDB (MySQL-compatible)
- **Auth**: JWT tokens (7-day expiry)
- **File Structure**: `/app/client/`, `/app/server/`, `/app/database/`

## What's Been Implemented

### Iteration 1 - Core MVP
- Auth (register, login, JWT), Groups CRUD, Posts CRUD, Comments, Votes, Dark theme UI

### Iteration 2 - Feature Expansion
- Edit/Delete posts, Search (keyword + tag), User profiles with stats/bio, Private group access control, Tags system

### Iteration 3 - Comments & Sorting (Jan 2026)
- [x] **Delete Comments**: Author-only deletion with cascade (replies auto-deleted)
- [x] **Nested Comments**: Reply threads via parent_id, up to 3 levels deep, indented tree rendering
- [x] **Post Sorting**: Newest, Oldest, Top Voted, Most Discussed — pill buttons with live reload
- [x] **Auth Fix**: Resolved intermittent blank page after login (token race condition)

### Database Tables
- users (user_id, username, email, password_hash, anonymous_name, bio, avatar_color, created_at)
- groups_table (group_id, name, description, creator_id, is_private, created_at)
- group_members (id, group_id, user_id, role, joined_at)
- posts (post_id, user_id, group_id, title, content, tags, created_at)
- comments (comment_id, post_id, user_id, content, parent_id, created_at)
- votes (vote_id, user_id, post_id, vote_type, created_at)

## Testing Status
- Iteration 1: Backend 100%, Frontend 100%
- Iteration 2: Backend 95%, Frontend 100%
- Iteration 3: Backend 96%, Frontend 100% (after auth fix)

## Remaining Backlog
### P1
- [ ] Post bookmarks/save
- [ ] Group invitation system for private groups

### P2
- [ ] Notification system
- [ ] Admin moderation tools
- [ ] Dark/Light theme toggle

### P3
- [ ] User reputation system
- [ ] Admin dashboard
- [ ] Analytics
