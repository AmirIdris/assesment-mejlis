# Al-Huda Knowledge & Workflow Portal

An internal tool designed to help Council members manage religious documents and automate administrative workflows using AI. The portal features RAG (Retrieval Augmented Generation), workflow automation, real-time notifications, and role-based access control.

## Project Overview

The Al-Huda Portal is a monorepo application built with:
- **Frontend**: TanStack Start with Tailwind CSS and ShadCN UI
- **Backend**: NestJS with REST API (session-based authentication)
- **Database**: PostgreSQL with Prisma ORM
- **Runtime**: Bun (fast JavaScript runtime)
- **Monorepo**: Turborepo for build orchestration

## Monorepo Structure

```
fedral-mejlis-assesment/
├── apps/
│   ├── web/          # TanStack Start frontend application
│   └── server/       # NestJS backend application
├── packages/
│   ├── database/     # Prisma schema and database client
│   └── shared-types/ # Shared Zod schemas and TypeScript types
└── docs/             # Project documentation
```

## Prerequisites

- **Bun**: >= 1.0.0 ([Install Bun](https://bun.sh))
- **PostgreSQL**: >= 14.0 (for database)
- **Git**: For version control

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fedral-mejlis-assesment
```

### 2. Install Bun (if not already installed)

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

### 3. Install Dependencies

Install all dependencies for the monorepo:
```bash
bun install
```

### 4. Database Setup

#### 4.1. Create PostgreSQL Database

Create a new PostgreSQL database:
```sql
CREATE DATABASE alhuda_portal;
```

#### 4.2. Configure Environment Variables

Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/alhuda_portal?schema=public"

# Server Configuration
SERVER_PORT=5001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-strong-random-secret-key-here-change-in-production
SESSION_MAX_AGE=604800000  # 7 days in milliseconds
SESSION_SAME_SITE=lax  # Options: 'lax', 'strict', or 'none'
```

**Important:** Generate a strong random secret for `SESSION_SECRET`:
```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 4.3. Generate Prisma Client

```bash
cd packages/database
bun run db:generate
```

#### 4.4. Run Database Migrations

```bash
# From packages/database directory
bun run db:migrate
```

This will:
- Create all database tables (User, Document, ChatSession, etc.)
- Create the session table for `connect-pg-simple`
- Apply all schema changes

#### 4.5. (Optional) Seed the Database

```bash
bun run db:seed
```

### 5. Web Application Setup

The web application (TanStack Start) is located in `apps/web`:

```bash
cd apps/web
bun run dev
```

The web app will start on `http://localhost:3000` (default Vinxi port).

**Web-specific scripts:**
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Lint TypeScript files
- `bun run typecheck` - Type check without building

### 6. Server Application Setup

The NestJS server is located in `apps/server`:

```bash
cd apps/server
bun run dev
```

The server will start on `http://localhost:5001/api` (or the port specified in `SERVER_PORT`).

**Server-specific scripts:**
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start:prod` - Start production server
- `bun run lint` - Lint TypeScript files
- `bun run test` - Run unit tests

### 7. Running Everything Together

From the root directory, run all applications in development mode:

```bash
bun run dev
```

This uses Turborepo to run all apps in parallel.

## Development Workflow

### Running All Applications

Start all apps in development mode:
```bash
bun run dev
```

### Running Individual Applications

Start only the frontend:
```bash
cd apps/web
bun run dev
```

Start only the backend:
```bash
cd apps/server
bun run dev
```

### Building

Build all apps and packages:
```bash
bun run build
```

### Testing

Run tests across all packages:
```bash
bun run test
```

### Linting

Lint all packages:
```bash
bun run lint
```

### Cleaning

Remove all build artifacts:
```bash
bun run clean
```

## Available Scripts

- `bun run dev` - Start all applications in development mode
- `bun run build` - Build all apps and packages
- `bun run test` - Run tests across all packages
- `bun run lint` - Lint all packages
- `bun run clean` - Clean all build artifacts
- `bun run format` - Format code with Prettier

## Session Authentication

### Overview

The application uses **session-based authentication** (not JWT) for security and simplicity. Sessions are stored in PostgreSQL using `connect-pg-simple`, providing server-side session management.

### How It Works

1. **Login Flow:**
   - User submits email and password to `/api/auth/login`
   - Server validates credentials using bcrypt password comparison
   - If valid, user information (userId, email, role) is stored in the session
   - Session ID is sent to client as an HTTP-only cookie (`sessionId`)
   - Client receives user data in response

2. **Session Storage:**
   - Sessions are stored in PostgreSQL `session` table (automatically created)
   - Session data includes: `userId`, `email`, and `role`
   - Sessions expire after 7 days (configurable via `SESSION_MAX_AGE`)
   - Session table is managed by `connect-pg-simple` with automatic cleanup

3. **Authentication Guard:**
   - `SessionAuthGuard` checks for valid session on protected routes
   - Extracts user info from session and attaches to `request.user`
   - Public routes are marked with `@Public()` decorator

4. **Session Configuration:**
   - **Cookie Settings:**
     - `httpOnly: true` - Prevents JavaScript access (XSS protection)
     - `secure: true` in production (HTTPS only)
     - `sameSite: 'lax'` - CSRF protection
   - **Session Store:** PostgreSQL via `connect-pg-simple`
   - **Session Secret:** Must be set via `SESSION_SECRET` environment variable

5. **Logout:**
   - Calls `/api/auth/logout` which destroys the session
   - Session is removed from database
   - Cookie is cleared on client side

### Frontend Session Handling

- Frontend uses `AuthProvider` context to manage user state
- Session cookie is automatically sent with all API requests (credentials: true)
- User state is refreshed on page load via `/api/auth/me` endpoint
- No manual token management required

### Security Features

- Passwords are hashed using bcrypt (10 rounds)
- Session IDs are cryptographically random
- HTTP-only cookies prevent XSS attacks
- SameSite cookie attribute prevents CSRF attacks
- Session data is server-side only (not exposed to client)

## Role Assignment Logic

### Automatic Role Assignment

When a new user signs up, the system automatically assigns a role based on the following logic:

1. **First User = ADMIN:**
   - If the database has zero users, the first signup automatically receives the `ADMIN` role
   - This ensures there's always at least one administrator in the system
   - Logic: `const role = userCount === 0 ? 'ADMIN' : 'USER';`

2. **Subsequent Users = USER:**
   - All users after the first signup receive the `USER` role by default
   - Only existing admins can change user roles after signup

### Role Management

- **Role Assignment:** Only `ADMIN` users can modify user roles
- **Role Change:** Admins can update user roles via the `/api/users/:id` PATCH endpoint
- **Role Enum:** Currently supports `ADMIN` and `USER` roles (defined in Prisma schema)

### Role Assignment Code

The role assignment happens in `apps/server/src/auth/auth.service.ts`:

```typescript
// Check if this is the first user (becomes ADMIN)
const userCount = await this.prisma.user.count();
const role = userCount === 0 ? 'ADMIN' : 'USER';
```

## Admin Privileges

### What Admins Can Do

Administrators (`ADMIN` role) have full system access:

1. **User Management:**
   - View all users (`GET /api/users`)
   - View individual user details (`GET /api/users/:id`)
   - Update user roles (`PATCH /api/users/:id`)
   - Delete users (`DELETE /api/users/:id`)
   - Search and filter users by role or email

2. **System Access:**
   - Access to all protected routes
   - Full CRUD operations on all resources
   - System configuration and settings (when implemented)
   - Audit logs and system monitoring (when implemented)

3. **Role-Based Access Control:**
   - Admin-only endpoints are protected with `@Roles('ADMIN')` decorator
   - Combined with `SessionAuthGuard` and `RolesGuard` for double protection
   - Frontend routes can check `user.role === 'ADMIN'` for UI restrictions

### Admin Protection

- **Backend:** Routes protected with `@Roles('ADMIN')` decorator
- **Guards:** `RolesGuard` checks user role from session before allowing access
- **Frontend:** Admin-only UI elements check `user.role === 'ADMIN'`
- **API:** All admin endpoints return 403 Forbidden if user is not admin

### Example Admin Endpoints

```typescript
@Controller('users')
@UseGuards(SessionAuthGuard, RolesGuard)
export class UsersController {
  @Get()
  @Roles('ADMIN')  // Only admins can access
  async findAll() { ... }
  
  @Patch(':id')
  @Roles('ADMIN')  // Only admins can update roles
  async update() { ... }
}
```

## Security Assumptions

### What We Assume

1. **HTTPS in Production:**
   - Application assumes HTTPS is used in production
   - Session cookies use `secure: true` flag in production
   - All API communication should be encrypted

2. **Database Security:**
   - PostgreSQL database is properly secured
   - Database credentials are kept secret
   - Database access is restricted to application servers only

3. **Environment Variables:**
   - All secrets are stored in environment variables (never committed)
   - `SESSION_SECRET` is a strong, random value
   - `DATABASE_URL` contains valid credentials

4. **Network Security:**
   - CORS is configured to only allow trusted origins
   - API is not exposed to public internet without authentication
   - Rate limiting should be implemented in production (not currently implemented)

5. **Session Security:**
   - Session cookies are HTTP-only (not accessible via JavaScript)
   - Session IDs are cryptographically random
   - Sessions expire after configured time period
   - Session data is stored server-side only

6. **Password Security:**
   - Passwords are hashed with bcrypt (10 rounds)
   - Passwords are never stored in plain text
   - Password validation should be enforced (minimum length, complexity)

7. **Role-Based Access:**
   - Users cannot escalate their own privileges
   - Only admins can modify user roles
   - Role checks happen on both frontend and backend

### What We Don't Assume

- **Client-Side Security:** Frontend role checks are for UX only, not security
- **API Security:** All security must be enforced on the backend
- **Input Validation:** All user input is validated using Zod schemas
- **SQL Injection:** Prisma ORM prevents SQL injection attacks

## Known Limitations

### Current Limitations

1. **Role System:**
   - Only two roles: `ADMIN` and `USER`
   - No granular permissions system (all-or-nothing admin access)
   - Cannot assign custom permissions to users
   - No role hierarchy or inheritance

2. **Session Management:**
   - No session timeout on inactivity (only absolute expiration)
   - No concurrent session limit (users can have multiple active sessions)
   - No session revocation mechanism (except logout)
   - Session cleanup relies on PostgreSQL expiration

3. **Authentication:**
   - No password reset functionality
   - No email verification
   - No two-factor authentication (2FA)
   - No OAuth/social login integration
   - No account lockout after failed login attempts

4. **Security:**
   - No rate limiting on API endpoints
   - No IP-based blocking or whitelisting
   - No audit logging for security events
   - No password complexity requirements enforced
   - No account expiration or deactivation

5. **User Management:**
   - Admins cannot see user activity history
   - No user profile management (name, avatar, etc.)
   - No bulk user operations
   - No user import/export functionality

6. **Database:**
   - No database connection pooling configuration
   - No read replicas for scaling
   - No database backup/restore documentation
   - Session table cleanup is automatic but not configurable

7. **Frontend:**
   - No offline support
   - No service worker for caching
   - No progressive web app (PWA) features
   - Client-side role checks are for UX only (not security)

8. **Development:**
   - No comprehensive test coverage
   - No E2E testing setup
   - No CI/CD pipeline documentation
   - No deployment documentation

### Future Improvements

- Implement granular permission system
- Add password reset and email verification
- Add rate limiting and DDoS protection
- Implement audit logging
- Add two-factor authentication
- Create admin dashboard for system monitoring
- Add user activity tracking
- Implement session management UI for admins

## Project Architecture

### User Roles

- **ADMIN**: Full system access including user management, role assignment, and all protected resources
- **USER**: Standard user with access to core features (document upload, chat, etc.)  - Zod validation for forms

## Technology Stack

### Frontend
- TanStack Start (React framework)
- TanStack Router (file-based routing)
- TypeScript (strict mode)
- Tailwind CSS
- ShadCN UI (when implemented)
- TanStack Query (data fetching)
- Vercel AI SDK (for future RAG features)
- Recharts (for future analytics)
- Zod (validation)

### Backend
- NestJS
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL
- Express Session (session-based auth)
- connect-pg-simple (PostgreSQL session store)
- bcryptjs (password hashing)
- Vercel AI SDK (for future RAG features)
- Inngest (for future workflow automation)
- WebSockets (@nestjs/websockets) (for future real-time features)

### Shared
- Turborepo (monorepo tooling)
- Prisma (database)
- Zod (validation)
- TypeScript (type safety)

## Development Guidelines

- **Type Safety**: No `any` types allowed - use strict TypeScript
- **Error Handling**: Proper try/catch blocks and API error responses
- **Loading States**: Use ShadCN Skeletons and Next.js `loading.tsx`
- **Testing**: Write tests for critical logic, especially AI functionality
- **Code Formatting**: Use Prettier for consistent code style

## Environment Variables

### Required Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/alhuda_portal?schema=public"

# Session Security (Required)
SESSION_SECRET="your-strong-random-secret-key-here"

# Server Configuration (Optional - has defaults)
SERVER_PORT=5001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# Session Configuration (Optional - has defaults)
SESSION_MAX_AGE=604800000  # 7 days in milliseconds
SESSION_SAME_SITE=lax  # Options: 'lax', 'strict', or 'none'
```

### Variable Descriptions

- **`DATABASE_URL`** (Required): PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database?schema=public`
  - Used by Prisma and session store

- **`SESSION_SECRET`** (Required): Secret key for signing session cookies
  - Must be a strong, random string (32+ characters recommended)
  - Generate with: `openssl rand -base64 32`
  - **Never commit this to version control**

- **`SERVER_PORT`** (Optional): Backend server port
  - Default: `5001`
  - Change if port conflicts occur

- **`CORS_ORIGIN`** (Optional): Allowed origin for CORS
  - Default: `http://localhost:3000`
  - Set to your frontend URL in production
  - Must match the frontend URL exactly

- **`NODE_ENV`** (Optional): Environment mode
  - Options: `development`, `production`
  - Default: `development`
  - Affects cookie security settings

- **`SESSION_MAX_AGE`** (Optional): Session expiration time
  - Default: `604800000` (7 days in milliseconds)
  - Set to milliseconds (e.g., 86400000 = 1 day)

- **`SESSION_SAME_SITE`** (Optional): SameSite cookie attribute
  - Options: `lax`, `strict`, `none`
  - Default: `lax`
  - Use `none` only with HTTPS and proper CORS setup

### Optional Variables (Future Features)

These may be needed for future features:
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI provider API key (for RAG features)
- `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` - Inngest credentials (for workflow automation)

## Documentation

- [Product Requirements Document](./docs/prd.md) - Complete project specifications

## License

Private project for AAIAHC assessment.

