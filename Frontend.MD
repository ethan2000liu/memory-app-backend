# API Changes Documentation

## Authentication
- Registration no longer returns JWT token
  - Users must verify email before logging in
  - Frontend should show "Check your email" message after registration

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
1. All endpoints except these require JWT token:
   - POST /auth/register
   - POST /auth/login
   - POST /auth/logout
   - POST /auth/resend-verification

2. Token must be included in header:
   ```
   Authorization: Bearer your_jwt_token
   ```

3. Token expiration:
   - Tokens expire after 24 hours
   - Frontend should handle 401 errors and redirect to login

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

### Likes
- POST /likes
  - Uses memory_id instead of post_id
  - No longer requires user_id in body
  - Uses authenticated user's ID

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
json
{
"error": "Descriptive error message"
}

Common status codes:
- 400: Bad request (missing/invalid parameters)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (no permission)
- 404: Not found
- 500: Server error

## Testing Notes
1. Create test user
2. Verify email
3. Login to get token
4. Use token for all authenticated requests
5. Handle token expiration (24h)
6. Test privacy controls with multiple users