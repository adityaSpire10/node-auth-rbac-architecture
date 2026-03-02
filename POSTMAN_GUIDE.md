# Postman Collection Guide

## Overview
Complete API collection for the Authentication Backend with JWT + Session-based authentication and RBAC (Role-Based Access Control).

## Quick Start

### 1. Import Collection into Postman

1. Open Postman
2. Click **File** → **Import** (or use `Ctrl+O`)
3. Select **Upload Files**
4. Choose `Postman_Collection.json` from the project root directory
5. Click **Import**

### 2. Configure Environment Variables

After importing, set the following variables in Postman:

**In the collection variables tab:**
- `base_url`: http://localhost:3000 (default)
- `access_token`: Leave empty initially (will be populated after login)
- `refresh_token`: Leave empty initially (will be populated after login)

### 3. Testing Workflow

#### Step 1: Register a New User
1. Go to **Authentication** → **Register**
2. Update the request body with your details
3. Send the request
4. Copy the `accessToken` from the response
5. Paste it into the `access_token` variable
6. Copy the `refreshToken` from the response
7. Paste it into the `refresh_token` variable

Or use the seeded admin account:

#### Step 1 (Alternative): Login with Admin Account
1. Go to **Authentication** → **Login**
2. Use credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123456`
3. Send the request
4. Copy tokens to the variables (same as above)

#### Step 2: Test Protected Endpoints
Now that you have tokens, you can access:
- **Authentication → Get Current User**: View your profile
- **Users → List Users**: View all users (admin only)
- **Roles → List Roles**: View all available roles

---

## API Endpoints Reference

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server status |

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register new user |
| POST | `/api/v1/auth/login` | ❌ | Login with email/password |
| POST | `/api/v1/auth/refresh` | ❌ | Get new access token using refresh token |
| POST | `/api/v1/auth/logout` | ❌ | Logout (revoke single token) |
| GET | `/api/v1/auth/me` | ✅ | Get current user profile |
| POST | `/api/v1/auth/logout-all` | ✅ | Logout from all devices |
| PATCH | `/api/v1/auth/change-password` | ✅ | Change password |

### User Management Endpoints

| Method | Endpoint | Auth | Role Required | Description |
|--------|----------|------|---------------|-------------|
| GET | `/api/v1/users` | ✅ | admin | List all users (paginated) |
| GET | `/api/v1/users/:id` | ✅ | admin, moderator | Get user by ID |
| PATCH | `/api/v1/users/:id` | ✅ | — | Update user (owner or admin) |
| PATCH | `/api/v1/users/:id/status` | ✅ | admin | Toggle user active status |
| POST | `/api/v1/users/:id/roles` | ✅ | admin | Assign roles to user |
| DELETE | `/api/v1/users/:id` | ✅ | admin | Delete user (soft delete) |

### Role Management Endpoints

| Method | Endpoint | Auth | Role Required | Description |
|--------|----------|------|---------------|-------------|
| GET | `/api/v1/roles` | ✅ | admin, moderator | List all roles |
| GET | `/api/v1/roles/:id` | ✅ | admin, moderator | Get role by ID |
| POST | `/api/v1/roles` | ✅ | admin | Create new role |
| PUT | `/api/v1/roles/:id` | ✅ | admin | Update role |
| DELETE | `/api/v1/roles/:id` | ✅ | admin | Delete role |

---

## Request/Response Examples

### Registration Request
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass@123",
  "phone": "+1234567890"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

### Login Request
```json
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@example.com",
      "is_active": true,
      "is_verified": true,
      "Roles": [
        {
          "id": 1,
          "roleName": "admin",
          "status": "active"
        }
      ]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Authorization Header Format
```
Authorization: Bearer <access_token>
```

---

## Seeded Data

### Default Roles
1. **Admin** - Full system access
2. **Moderator** - Limited administrative capabilities
3. **User** - Regular user access

### Seeded Admin User
- **Email**: admin@example.com
- **Password**: Admin@123456
- **Role**: admin

---

## Common Errors & Solutions

### 401 Unauthorized
**Cause**: Missing or invalid access token
- Make sure `Authorization` header is set with `Bearer <token>`
- Token might be expired (15 min expiry)
- Use refresh endpoint to get new token

### 403 Forbidden
**Cause**: User doesn't have required role
- Check user's assigned roles
- Only admins can access certain endpoints
- Moderators have limited access

### 400 Bad Request
**Cause**: Invalid request data
- Check password meets complexity requirements
- Email format validation is enforced
- All required fields must be provided

### 422 Validation Error
**Cause**: Validation failed on request body
- Review error details in response
- Fix field values according to error messages

### 404 Not Found
**Cause**: Resource doesn't exist
- Check if user/role ID is correct
- Verify resource hasn't been deleted

---

## Advanced Usage

### Token Rotation
When using the refresh endpoint:
1. Old refresh token is automatically revoked
2. New access + refresh tokens are issued
3. This implements secure token rotation pattern

### Rate Limiting
- **Auth endpoints**: 20 requests per 15 minutes
- **General API**: 300 requests per 15 minutes
- Status code `429` returned when limit exceeded

### Role-Based Access Control (RBAC)
Multiple roles can be assigned to a single user:
```json
{
  "roleIds": [1, 2, 3]
}
```

User will have combined permissions from all assigned roles.

### Pagination
List endpoints support pagination:
```
GET /api/v1/users?page=1&limit=10&search=john
```

Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Optional search filter

---

## Environment Configuration

### Development
```
base_url: http://localhost:3000
```

### Production
```
base_url: https://api.yourdomain.com
(Update with your production URL)
```

Create separate Postman environments for dev/staging/production by:
1. Click **Environments** → **Add**
2. Name it (e.g., "Production")
3. Set variables for production values
4. Switch environments when needed

---

## Security Best Practices

1. **Never commit tokens** to version control
2. **Regenerate secrets** for production
3. **Use HTTPS** in production
4. **Store tokens securely** in your application
5. **Implement token expiration** (access: 15 min, refresh: 7 days)
6. **Rotate refresh tokens** on each use
7. **Monitor for suspicious access patterns**
8. **Log out from all sessions** periodically

---

## Troubleshooting

### Collection Import Issues
- Ensure file is valid JSON
- Check file hasn't been corrupted
- Re-download from project root

### Token Expiration
- Access tokens expire after 15 minutes
- Use refresh endpoint to get new token
- If stuck, login again

### CORS Errors
- Verify frontend is sending from allowed origin
- Check CORS configuration matches your setup

### Rate Limit Hit
- Wait 15 minutes before retrying
- Batch requests more efficiently
- Consider implementing request queuing

---

## Support & Documentation

For detailed API documentation, see:
- `AUTHENTICATION_GUIDE.md` - Complete auth flow documentation
- `TESTING_GUIDE.md` - Comprehensive testing procedures
- `IMPLEMENTATION_SUMMARY.md` - System architecture details
