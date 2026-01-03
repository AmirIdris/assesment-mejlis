# API Documentation

This document provides comprehensive documentation for all available API endpoints in the Federal Mejlis Assessment Server.

## Base Information

- **Base URL**: `http://localhost:5001/api` (default port, configurable via `SERVER_PORT` env variable)
- **Global Prefix**: `/api`
- **Authentication**: Session-based authentication using cookies
- **Content-Type**: `application/json`

## Authentication

The API uses **session-based authentication** with cookies. All authenticated endpoints require:
- A valid session cookie (`sessionId`)
- The session must contain a valid `userId`

### Session Configuration
- Session cookie name: `sessionId`
- Cookie settings:
  - `httpOnly: true` (not accessible via JavaScript)
  - `secure: true` in production (HTTPS only)
  - `sameSite: 'lax'` (default)
  - `maxAge: 604800000` (7 days, configurable via `SESSION_MAX_AGE`)

### Making Authenticated Requests
When making requests from the frontend, ensure:
1. `credentials: 'include'` is set in fetch requests
2. Cookies are automatically sent with requests
3. The session is established after successful login/signup

---

## API Endpoints

### Authentication Endpoints

#### 1. Login

Authenticate a user and create a session.

**Endpoint**: `POST /api/auth/login`

**Access**: Public (no authentication required)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Schema**:
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 6 characters

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN" | "USER"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "success": false,
    "error": "Unauthorized",
    "message": "Invalid credentials",
    "statusCode": 401,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/auth/login"
  }
  ```

**Example**:
```typescript
const response = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

---

#### 2. Signup

Register a new user account.

**Endpoint**: `POST /api/auth/signup`

**Access**: Public (no authentication required)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123"
}
```

**Request Schema**:
- `email` (string, required): Valid email address
- `password` (string, required): 
  - Minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number

**Role Assignment**:
- First user registered becomes `ADMIN`
- All subsequent users become `USER`

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "role": "ADMIN" | "USER"
  }
}
```

**Error Responses**:
- `409 Conflict`: User with email already exists
  ```json
  {
    "success": false,
    "error": "Conflict",
    "message": "User with this email already exists",
    "statusCode": 409,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/auth/signup"
  }
  ```
- `400 Bad Request`: Validation error (invalid email or password format)

**Example**:
```typescript
const response = await fetch('http://localhost:5001/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'SecurePass123'
  })
});
```

---

#### 3. Logout

Destroy the current session and log out the user.

**Endpoint**: `POST /api/auth/logout`

**Access**: Authenticated (requires valid session)

**Request Body**: None

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: No valid session

**Example**:
```typescript
const response = await fetch('http://localhost:5001/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
```

---

#### 4. Get Current User

Get the currently authenticated user's information.

**Endpoint**: `GET /api/auth/me`

**Access**: Authenticated (requires valid session)

**Request Body**: None

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN" | "USER"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: No valid session or user not found

**Example**:
```typescript
const response = await fetch('http://localhost:5001/api/auth/me', {
  method: 'GET',
  credentials: 'include'
});
```

---

### User Management Endpoints

All user management endpoints require:
- **Authentication**: Valid session
- **Authorization**: `ADMIN` role only

---

#### 5. List Users

Get a paginated list of all users with optional filtering.

**Endpoint**: `GET /api/users`

**Access**: Admin only

**Query Parameters**:
- `page` (number, optional): Page number (default: 1, minimum: 1)
- `limit` (number, optional): Items per page (default: 10, minimum: 1, maximum: 100)
- `role` (string, optional): Filter by role (`ADMIN` or `USER`)
- `search` (string, optional): Search by email (case-insensitive)

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "ADMIN" | "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin user

**Example**:
```typescript
// Get first page with default limit
const response = await fetch('http://localhost:5001/api/users?page=1&limit=10', {
  method: 'GET',
  credentials: 'include'
});

// Search for users with specific role
const response = await fetch('http://localhost:5001/api/users?role=ADMIN&search=admin', {
  method: 'GET',
  credentials: 'include'
});
```

---

#### 6. Get User by ID

Get a specific user by their ID.

**Endpoint**: `GET /api/users/:id`

**Access**: Admin only

**Path Parameters**:
- `id` (string, required): User UUID

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "ADMIN" | "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin user
- `404 Not Found`: User not found
  ```json
  {
    "success": false,
    "error": "Not Found",
    "message": "User with ID {id} not found",
    "statusCode": 404,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/users/{id}"
  }
  ```

**Example**:
```typescript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
  method: 'GET',
  credentials: 'include'
});
```

---

#### 7. Update User

Update a user's information (email and/or role).

**Endpoint**: `PATCH /api/users/:id`

**Access**: Admin only

**Path Parameters**:
- `id` (string, required): User UUID

**Request Body**:
```json
{
  "email": "updated@example.com",
  "role": "ADMIN"
}
```

**Request Schema**:
- `email` (string, optional): Valid email address
- `role` (string, optional): `ADMIN` or `USER`

**Note**: At least one field must be provided.

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "updated@example.com",
  "role": "ADMIN",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin user
- `404 Not Found`: User not found
- `400 Bad Request`: Validation error

**Example**:
```typescript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    role: 'ADMIN'
  })
});
```

---

#### 8. Delete User

Delete a user by their ID.

**Endpoint**: `DELETE /api/users/:id`

**Access**: Admin only

**Path Parameters**:
- `id` (string, required): User UUID

**Request Body**: None

**Response** (200 OK):
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin user
- `404 Not Found`: User not found

**Example**:
```typescript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
  method: 'DELETE',
  credentials: 'include'
});
```

---

## Data Types

### User Object
```typescript
{
  id: string;           // UUID
  email: string;        // Email address
  role: "ADMIN" | "USER";
  createdAt?: Date;     // ISO 8601 date string (in user endpoints)
  updatedAt?: Date;     // ISO 8601 date string (in user endpoints)
}
```

### Role Enum
- `ADMIN`: Administrator with full access
- `USER`: Regular user with limited access

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or invalid request
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

---

## CORS Configuration

The API is configured to accept requests from:
- **Origin**: Configurable via `CORS_ORIGIN` environment variable (default: `http://localhost:3000`)
- **Credentials**: Enabled (cookies are sent)
- **Methods**: `GET`, `POST`, `PATCH`, `DELETE`, `PUT`, `OPTIONS`
- **Headers**: `Content-Type`, `Authorization`

---

## Environment Variables

The following environment variables can be configured:

- `SERVER_PORT`: Server port (default: `5001`)
- `CORS_ORIGIN`: Allowed CORS origin (default: `http://localhost:3000`)
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret key for session encryption (required)
- `SESSION_MAX_AGE`: Session max age in milliseconds (default: `604800000` = 7 days)
- `NODE_ENV`: Environment (`development` | `production`)

---

## Frontend Integration Examples

### TypeScript/React Example

```typescript
// api.ts
const API_BASE_URL = 'http://localhost:5001/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
}

export async function listUsers(query?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.role) params.append('role', query.role);
  if (query?.search) params.append('search', query.search);

  const response = await fetch(`${API_BASE_URL}/users?${params}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}
```

### Axios Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  signup: (email: string, password: string) =>
    api.post('/auth/signup', { email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// User endpoints
export const usersApi = {
  list: (query?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get('/users', { params: query }),
  
  getById: (id: string) => api.get(`/users/${id}`),
  
  update: (id: string, data: { email?: string; role?: string }) =>
    api.patch(`/users/${id}`, data),
  
  delete: (id: string) => api.delete(`/users/${id}`),
};
```

---

## Notes

1. **Session Management**: The API uses server-side sessions stored in PostgreSQL. Sessions are automatically managed via cookies.

2. **Password Requirements**: 
   - Login: Minimum 6 characters
   - Signup: Minimum 8 characters with uppercase, lowercase, and number

3. **Role Assignment**: The first user to sign up automatically becomes an `ADMIN`. All subsequent users are assigned the `USER` role.

4. **Pagination**: User list endpoints support pagination with configurable page size (max 100 items per page).

5. **Search**: User list search is case-insensitive and searches email addresses.

6. **Validation**: All request bodies are validated using Zod schemas. Invalid requests return `400 Bad Request` with detailed error messages.

---

## Support

For issues or questions, please refer to the project documentation or contact the development team.

