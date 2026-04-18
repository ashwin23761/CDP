# CDP Test Credentials

## Database
- **Host**: localhost
- **User**: cdpuser
- **Password**: cdppass123
- **Database**: cdp
- **Port**: 3306

## Test User Accounts
| Username | Email | Password | User ID | Notes |
|----------|-------|----------|---------|-------|
| demouser | demo@cdp.com | demo123 | 2 | Main test user |
| testuser | test@cdp.com | (seeded with hash) | 1 | Seed data user |
| campususer | campus@cdp.com | campus123 | 4 | Created during testing |

## JWT Configuration
- **Secret**: cdp_super_secret_key_change_in_production_2024
- **Expiry**: 7 days

## Service Ports
- **Backend**: 8001 (Express.js)
- **Frontend**: 3000 (Vite dev server)
- **MySQL/MariaDB**: 3306

## Preview URL
- https://a3fe8a7f-b9d2-4218-94b3-33c0a65d953f.preview.emergentagent.com

## API Endpoints (all prefixed with /api)
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- Groups: GET/POST /api/groups, GET /api/groups/:id, POST /api/groups/:id/join|leave
- Posts: GET/POST /api/posts, GET/PUT/DELETE /api/posts/:id, GET /api/posts/search
- Comments: POST /api/comments, GET /api/comments/:postId
- Votes: POST /api/votes, GET /api/votes/:postId
- Profile: GET /api/profile/:userId, PUT /api/profile
