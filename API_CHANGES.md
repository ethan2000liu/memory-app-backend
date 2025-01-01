# API Changes Documentation

## Authentication
- Registration no longer returns JWT token
  - Users must verify email before logging in
  - Frontend should show "Check your email" message after registration

- Email Verification Check (New!)
  - GET /auth/verify-email/:email
  - No authentication required
  - URL encode the email parameter
  - Response:
    ```json
    {
      "email": "user@example.com",
      "email_verified": true|false,
      "created_at": "2024-XX-XX..."
    }
    ```

- Login returns:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_uuid",
      "email": "user@example.com",
      "name": "username"
    },
    "expiresIn": 86400000 // 24 hours in milliseconds
  }
  ```

## Security Updates
1. Public endpoints (no token required):
   - POST /auth/register
   - POST /auth/login
   - POST /auth/logout
   - POST /auth/resend-verification
   - GET /auth/verify-email/:email (New!)

2. Token must be included in header:
   ```
   Authorization: Bearer your_jwt_token
   ```

3. Token expiration:
   - Tokens expire after 24 hours
   - Frontend should handle 401 errors and redirect to login

## Row Level Security (New!)
- Likes table has RLS enabled:
  - Users can only create/delete their own likes
  - Users can view likes on public memories and their own memories
  - Database-level security prevents unauthorized access

## Privacy Controls
1. Memories:
   - Users can only see their own private memories
   - Public memories are visible to all users
   - When viewing another user's profile, only public memories are shown

2. Profile Updates:
   - Users can only update their own profile
   - Attempting to update other profiles returns 403

## Endpoint Changes

### User Profile
- GET /users/:id
  - Returns public info for any user
  - Returns private info only for own profile

- PUT /users/:id
  - Can only update own profile
  - Requires authentication
  - Returns 403 if trying to update other profiles

### Memories
- GET /memories/all
  - Now supports user_id query parameter
  - Returns isOwner flag in response
  - Filters private memories based on ownership

- PUT /memories/privacy
  - Requires memory_id and is_public in body
  - Can only toggle own memories

### Comments
- POST /comments
  - No longer requires user_id in body
  - Uses authenticated user's ID
  - Requires memory_id and content

### Likes (Updated!)
- POST /likes
  - Uses memory_id (not post_id)
  - Uses authenticated user's ID
  - Protected by RLS

- DELETE /likes
  - Requires memory_id in body
  - Uses authenticated user's ID
  - Protected by RLS

- GET /likes/:memoryId
  - Returns likes with user details
  - Response includes total_count
  - Protected by RLS

### Followers
- POST /followers/follow
  - Only requires user_id to follow
  - Cannot follow self
  - Checks for existing follow relationship

### Feed
- GET /feed
  - Supports three types: public, following, personal
  - Includes pagination info
  - Example:
    ```
    /feed?type=public&limit=10&offset=0
    ```
  - Response includes:
    - likes_count
    - comments_count
    - is_liked (by current user)
    - user details (name, avatar)

## Error Handling
All endpoints now return consistent error format:
```json
{
  "error": "Descriptive error message"
}
```

Common status codes:
- 400: Bad request (missing/invalid parameters)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (no permission)
- 404: Not found
- 500: Server error

## Testing Notes
1. Create test user
2. Check email verification status
3. Verify email
4. Login to get token
5. Use token for all authenticated requests
6. Handle token expiration (24h)
7. Test privacy controls with multiple users
8. Test RLS on likes table 

## Authentication Endpoints

### Email Verification Check
GET /auth/verify-email/:email

- URL Parameter:
  - email: URL encoded email address (e.g., "test%40example.com")

- No authentication required

- Success Response (200):
  ```json
  {
    "email": "test@example.com",
    "email_verified": true,
    "created_at": "2024-XX-XX..."
  }
  ```

- User Not Found (404):
  ```json
  {
    "error": "User not found",
    "email": "test@example.com"
  }
  ```

- Invalid Email (400):
  ```json
  {
    "error": "Email is required"
  }
  ```

- Server Error (500):
  ```json
  {
    "error": "Error checking email verification status",
    "details": "Error details (only in development mode)"
  }
  ```

Example Usage:
```bash
# Check email verification status
curl "http://localhost:3000/auth/verify-email/test%40example.com"
```

Note: Make sure to URL encode the email address in the frontend before making the request. 

### Register New User
POST /auth/register

- Request Body:
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }
  ```

- Success Response (201):
  ```json
  {
    "message": "Registration successful. Please check your email for verification.",
    "user": {
      "id": "user_uuid",
      "email": "test@example.com",
      "name": "Test User",
      "created_at": "2024-XX-XX..."
    }
  }
  ```

- Email Already Exists (400):
  ```json
  {
    "error": "User with this email already exists"
  }
  ```

- Invalid Input (400):
  ```json
  {
    "error": "Email, password, and name are required"
  }
  ```

- Password Too Weak (400):
  ```json
  {
    "error": "Password must be at least 6 characters"
  }
  ```

- Server Error (500):
  ```json
  {
    "error": "Error creating user"
  }
  ```

Example Usage:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Notes:
- No authentication token is returned on registration
- User must verify email before logging in
- Frontend should redirect to login page after showing "check email" message
- Password requirements:
  - Minimum 6 characters
  - No other special requirements 