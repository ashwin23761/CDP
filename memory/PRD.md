# CDP - Community Discussion Platform

## Original Problem Statement
Build a Community Discussion Platform (CDP) - a pseudo-anonymous web app for campus environments. User chose Node.js + Express backend, MySQL database, React + Vite frontend following PDF specifications exactly.

## Architecture
- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4
- **Backend**: Node.js + Express.js 5
- **Database**: MariaDB (MySQL-compatible)
- **Auth**: JWT tokens (7-day expiry)
- **File Structure**: `/app/client/`, `/app/server/`, `/app/database/`

## What's Been Implemented

### Iteration 1 (Jan 2026) - Core MVP
- [x] Auth: Register, Login, JWT session management
- [x] Groups: Create, List, Join, Leave, Delete (admin)
- [x] Posts: Create, List (with group filter)
- [x] Comments: Create, Get by Post
- [x] Votes: Upvote/Downvote with toggle
- [x] Dark theme UI with neon accents

### Iteration 2 (Jan 2026) - Feature Expansion
- [x] **Edit/Delete Posts**: Author-only ··· menu, inline editing with tag support
- [x] **Search**: Keyword search + tag-based search, dedicated search page, navbar search bar
- [x] **User Profiles**: Profile page with avatar, bio (editable), stats (posts/comments/groups/karma), Posts & Groups tabs
- [x] **Private Group Access Control**: Private groups hide posts from non-members, membership status/role shown on group detail page
- [x] **Tags System**: Posts can have tags (comma-separated), tags display on PostCard, clickable tags navigate to search

### Database Tables
- users (user_id, username, email, password_hash, anonymous_name, bio, avatar_color, created_at)
- groups_table (group_id, name, description, creator_id, is_private, created_at)
- group_members (id, group_id, user_id, role, joined_at)
- posts (post_id, user_id, group_id, title, content, tags, created_at)
- comments (comment_id, post_id, user_id, content, created_at)
- votes (vote_id, user_id, post_id, vote_type, created_at)

## Testing Status
- Iteration 1: Backend 100%, Frontend 100%
- Iteration 2: Backend 95%, Frontend 100%

## Remaining Backlog
### P1 (High)
- [ ] Nested comments (reply to comments)
- [ ] Delete comments
- [ ] Post sorting (by votes, date, most commented)

### P2 (Medium)
- [ ] Group invitation system for private groups
- [ ] Notification system
- [ ] Post bookmarks
- [ ] Admin moderation tools

### P3 (Low)
- [ ] Dark/Light theme toggle
- [ ] User reputation system
- [ ] Admin dashboard
- [ ] Analytics
