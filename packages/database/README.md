# @repo/database

Prisma database schema and client package for the Al-Huda Knowledge & Workflow Portal. This package serves as the single source of truth for database schema and provides a shared Prisma client for both NestJS backend and Next.js frontend.

## Overview

This package contains:
- Prisma schema definition with all database models
- Prisma client exports for use across the monorepo
- Database seeding scripts
- Migration management

## Installation

The package is automatically available in the monorepo workspace. To install dependencies:

```bash
npm install
```

## Prerequisites

- PostgreSQL database (version 14 or higher)
- Environment variable `DATABASE_URL` set in your `.env` file

## Environment Setup

Create a `.env` file in the root of the monorepo (or in this package) with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/alhuda_portal?schema=public"
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `db:generate` | `prisma generate` | Generate Prisma Client from schema |
| `db:migrate` | `prisma migrate dev` | Create and apply a new migration |
| `db:migrate:deploy` | `prisma migrate deploy` | Apply pending migrations (production) |
| `db:push` | `prisma db push` | Push schema changes without migration (dev only) |
| `db:seed` | `ts-node prisma/seed.ts` | Seed database with initial data |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |
| `db:format` | `prisma format` | Format Prisma schema file |
| `build` | `tsc` | Build TypeScript files |
| `dev` | `tsc --watch` | Watch mode for development |

## Database Schema

### Enums

**Role**
- `ADMIN` - Full system access
- `RESEARCHER` - Can upload documents and use AI RAG
- `OFFICER` - Handles workflow tasks

**DocumentStatus**
- `PENDING` - Awaiting processing
- `PROCESSING` - Currently being processed
- `PROCESSED` - Successfully processed
- `FAILED` - Processing failed
- `REJECTED` - Rejected by officer

**ChatMessageRole**
- `USER` - User message
- `ASSISTANT` - AI assistant response
- `SYSTEM` - System message

**ActionLogType**
- `DOCUMENT_UPLOADED` - Document upload event
- `DOCUMENT_PROCESSED` - Document processing complete
- `DOCUMENT_REJECTED` - Document rejection
- `CHAT_QUERY` - Chat query executed
- `USER_LOGIN` - User login event
- `USER_LOGOUT` - User logout event
- `PERMISSION_CHANGED` - Permission modification
- `AI_COST_INCURRED` - AI API cost tracking

### Models

#### User
Stores user accounts with authentication and role-based access.

- `id` (UUID) - Primary key
- `email` (String, unique) - User email
- `passwordHash` (String) - Hashed password
- `name` (String, optional) - User display name
- `role` (Role, default: RESEARCHER) - User role
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Relations:**
- `uploadedDocuments` - Documents uploaded by this user
- `chatSessions` - Chat sessions created by this user
- `actionLogs` - Action logs for this user

#### Document
Stores uploaded documents and their processing status.

- `id` (UUID) - Primary key
- `title` (String) - Document title
- `fileName` (String) - Original file name
- `filePath` (String, optional) - Storage path
- `fileSize` (Int, optional) - File size in bytes
- `mimeType` (String, optional) - MIME type
- `content` (String, optional) - Extracted text content
- `summary` (String, optional) - AI-generated summary
- `status` (DocumentStatus, default: PENDING) - Processing status
- `uploadedById` (String) - Foreign key to User
- `processedAt` (DateTime, optional) - Processing completion time
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Relations:**
- `uploader` - User who uploaded the document
- `documentChunks` - Text chunks for RAG/vector search
- `chatSessions` - Chat sessions using this document

#### DocumentChunk
Stores text chunks of documents for RAG (Retrieval Augmented Generation) and vector search.

- `id` (UUID) - Primary key
- `documentId` (String) - Foreign key to Document
- `chunkIndex` (Int) - Order of chunk in document
- `content` (String) - Text content of chunk
- `embedding` (String, optional) - Vector embedding (JSON or base64)
- `startChar` (Int, optional) - Character position in original document
- `endChar` (Int, optional) - Character position in original document
- `createdAt` (DateTime) - Creation timestamp

**Relations:**
- `document` - Parent document (cascade delete)

#### ChatSession
Manages conversation sessions for AI chat.

- `id` (UUID) - Primary key
- `userId` (String) - Foreign key to User
- `title` (String, optional) - Session title
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Relations:**
- `user` - User who created the session (cascade delete)
- `messages` - Chat messages in this session
- `documents` - Documents referenced in this session (many-to-many)

#### ChatMessage
Stores individual messages in chat sessions.

- `id` (UUID) - Primary key
- `sessionId` (String) - Foreign key to ChatSession
- `role` (ChatMessageRole) - Message role
- `content` (String) - Message content
- `toolCalls` (JSON, optional) - Tool calls made by AI
- `metadata` (JSON, optional) - Additional metadata (cost, tokens, etc.)
- `createdAt` (DateTime) - Creation timestamp

**Relations:**
- `session` - Parent chat session (cascade delete)

#### ActionLog
Audit trail for system actions and events.

- `id` (UUID) - Primary key
- `userId` (String, optional) - Foreign key to User
- `type` (ActionLogType) - Type of action
- `description` (String) - Action description
- `metadata` (JSON, optional) - Additional context
- `ipAddress` (String, optional) - User IP address
- `userAgent` (String, optional) - User agent string
- `createdAt` (DateTime) - Creation timestamp

**Relations:**
- `user` - User who performed the action (set null on delete)

#### WorkflowTask
Tracks Inngest workflow execution for document processing.

- `id` (UUID) - Primary key
- `documentId` (String) - Document being processed
- `eventId` (String, optional) - Inngest event ID
- `status` (String) - Task status (PENDING, RUNNING, COMPLETED, FAILED)
- `step` (String, optional) - Current workflow step
- `error` (String, optional) - Error message if failed
- `startedAt` (DateTime, optional) - Task start time
- `completedAt` (DateTime, optional) - Task completion time
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

## Relationships

- **User → Documents**: One-to-many (User can upload multiple documents)
- **User → ChatSessions**: One-to-many (User can have multiple chat sessions)
- **User → ActionLogs**: One-to-many (User can have multiple action logs)
- **Document → DocumentChunks**: One-to-many (Document can have multiple chunks)
- **Document ↔ ChatSessions**: Many-to-many (Documents can be used in multiple sessions)
- **ChatSession → ChatMessages**: One-to-many (Session can have multiple messages)

## Migration Guide

### Initial Setup

1. Set up your PostgreSQL database
2. Configure `DATABASE_URL` in your `.env` file
3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
4. Create initial migration:
   ```bash
   npm run db:migrate
   ```
5. Seed the database:
   ```bash
   npm run db:seed
   ```

### Development Workflow

For rapid iteration during development, use `db:push`:

```bash
npm run db:push
```

This pushes schema changes directly to the database without creating migration files.

### Production Deployments

For production, always use migrations:

```bash
npm run db:migrate:deploy
```

## Usage Examples

### Import Prisma Client

```typescript
// Import the singleton instance
import { prisma } from '@repo/database';

// Or import PrismaClient to create your own instance
import { PrismaClient } from '@repo/database';

// Import types
import type { User, Document, Role } from '@repo/database';
```

### Basic Queries

```typescript
// Find a user by email
const user = await prisma.user.findUnique({
  where: { email: 'admin@alhuda.local' },
});

// Create a document
const document = await prisma.document.create({
  data: {
    title: 'New Document',
    fileName: 'document.pdf',
    uploadedById: user.id,
    status: 'PENDING',
  },
});

// Find documents with relations
const documents = await prisma.document.findMany({
  where: { status: 'PROCESSED' },
  include: {
    uploader: true,
    documentChunks: true,
  },
});

// Create a chat session with messages
const session = await prisma.chatSession.create({
  data: {
    userId: user.id,
    title: 'New Chat',
    messages: {
      create: [
        {
          role: 'USER',
          content: 'Hello, AI!',
        },
      ],
    },
  },
});
```

### Using in NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class DocumentService {
  async findAll() {
    return prisma.document.findMany();
  }
}
```

### Using in Next.js

```typescript
import { prisma } from '@repo/database';

export async function getDocuments() {
  return prisma.document.findMany();
}
```

## Indexes

The schema includes indexes on:
- All foreign keys for join performance
- Commonly queried fields (email, role, status, createdAt)
- Composite indexes for common query patterns

## Notes

- All primary keys use UUIDs for better distributed system support
- Timestamps are automatically managed with `@default(now())` and `@updatedAt`
- Cascade deletes are used for dependent records (DocumentChunk, ChatMessage)
- Set null on delete for optional relationships (ActionLog.userId)
- Many-to-many relationship between ChatSession and Document uses Prisma implicit relation

## Troubleshooting

### Prisma Client Not Generated

If you see import errors, make sure to run:

```bash
npm run db:generate
```

### Migration Issues

If migrations fail, check:
1. Database connection string is correct
2. Database exists and is accessible
3. User has proper permissions

### Seed Script Issues

The seed script requires `bcryptjs`. Make sure it's installed:

```bash
npm install
```

## License

Private project for AAIAHC assessment.

