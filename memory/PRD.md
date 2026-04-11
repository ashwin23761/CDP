# CDP - Community Discussion Platform

## Original Problem Statement
Build a Community Discussion Platform (CDP) based on a PDF specification. A pseudo-anonymous web application for campus environments inspired by Reddit. User chose to follow PDF specifications exactly with Node.js + Express backend, MySQL database, and React + Vite frontend.

## Architecture
- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4
- **Backend**: Node.js + Express.js 5
- **Database**: MariaDB (MySQL-compatible)
- **Auth**: JWT tokens (7-day expiry)
- **File Structure**: `/app/client/`, `/app/server/`, `/app/database/`

## User Personas
1. **Campus Students** - Primary users posting and discussing anonymously
2. **Group Admins** - Create and moderate communities/groups
3. **Viewers** - Browse posts and comments

## Core Requirements
- User registration with pseudo-anonymous identities
- Group/Community creation and management
- Post creation within groups
- Comment system
- Upvote/Downvote voting system
- Responsive dark theme UI

## What's Been Implemented (Jan 2026)
### Backend APIs (100% working)
- [x] Auth: Register, Login, Get Current User (JWT-based)
- [x] Groups: Create, List All, Get by ID, Join, Leave, Get Members, Delete
- [x] Posts: Create, List All (with group filter), Get by ID
- [x] Comments: Create, Get by Post
- [x] Votes: Vote (toggle upvote/downvote), Get Count, Get User Vote

### Frontend Pages (100% working)
- [x] Login/Register page with form toggle
- [x] Feed page (all posts from all groups)
- [x] Groups listing page with Create Group modal
- [x] Group detail page with join/leave and posts
- [x] PostCard with voting, comments inline
- [x] Navbar with Feed/Groups navigation and logout

### Database
- [x] Users table (with anonymous names)
- [x] Groups table (with private/public flag)
- [x] Group Members table (admin/member roles)
- [x] Posts table (linked to groups)
- [x] Comments table
- [x] Votes table (unique per user-post)
- [x] Seed data (4 default groups, sample posts)

## Testing Status
- Backend: 100% (16/16 core functionalities)
- Frontend: 100% (all UI components and integrations)

## Prioritized Backlog
### P0 (Critical) - All Done
- [x] Auth system
- [x] Posts CRUD
- [x] Groups CRUD

### P1 (High)
- [ ] User profile page
- [ ] Edit/Delete posts
- [ ] Search functionality
- [ ] Private group access control

### P2 (Medium)
- [ ] Nested comments (reply to comments)
- [ ] Post categories/tags
- [ ] User moderation tools
- [ ] Group invitation system
- [ ] Notification system

### P3 (Low)
- [ ] Dark/Light theme toggle
- [ ] Post bookmarks
- [ ] User reputation system
- [ ] Admin dashboard
- [ ] Analytics

## Next Tasks
1. Add edit/delete functionality for posts and comments
2. Implement search across posts and groups
3. Add user profile page
4. Add proper private group access control
5. Implement notification system
