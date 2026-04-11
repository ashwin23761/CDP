# CDP Test Credentials

## Database
- **Host**: localhost
- **User**: cdpuser
- **Password**: cdppass123
- **Database**: cdp
- **Port**: 3306

## Test User Accounts
| Username | Email | Password | Notes |
|----------|-------|----------|-------|
| demouser | demo@cdp.com | demo123 | Pre-registered via API |
| testuser | test@cdp.com | (seeded with hash, use register flow) | Seed data user |
| campususer | campus@cdp.com | campus123 | Created during browser testing |

## JWT Configuration
- **Secret**: cdp_super_secret_key_change_in_production_2024
- **Expiry**: 7 days

## Service Ports
- **Backend**: 8001 (Express.js)
- **Frontend**: 3000 (Vite dev server)
- **MySQL/MariaDB**: 3306

## Preview URL
- https://a3fe8a7f-b9d2-4218-94b3-33c0a65d953f.preview.emergentagent.com

## API Base Path
- All API routes prefixed with `/api`
- Example: `/api/auth/login`, `/api/groups`, `/api/posts`
