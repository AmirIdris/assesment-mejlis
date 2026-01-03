# Phase 2: Database Package Setup - Implementation Plan

## Overview
This document outlines the detailed implementation plan for setting up the Prisma database package (`packages/database`) for the Al-Huda Knowledge & Workflow Portal. This package will serve as the single source of truth for database schema and provide a shared Prisma client for both the NestJS backend and Next.js frontend.

## Objectives
- ✅ Create a standalone Prisma package in the monorepo
- ✅ Define comprehensive database schema with all required models
- ✅ Establish proper relationships between models
- ✅ Configure indexes for optimal query performance
- ✅ Export Prisma client for use across the monorepo
- ✅ Set up database migrations and seed scripts
- ✅ Ensure type safety with TypeScript

## Implementation Steps

### Step 1: Initialize Prisma Package Structure

**1.1 Create Package Directory Structure**
```
packages/database/
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   └── index.ts
└── README.md
```

**1.2 Create `package.json`**
- Package name: `@repo/database`
- Dependencies:
  - `@prisma/client`: Latest version
  - `prisma`: Latest version (dev dependency)
- Scripts:
  - `db:generate` - Generate Prisma client
  - `db:migrate` - Run migrations
  - `db:seed` - Seed database
  - `db:studio` - Open Prisma Studio
  - `db:push` - Push schema changes (dev)
  - `build` - Build TypeScript files
  - `dev` - Watch mode for development

**1.3 Create `tsconfig.json`**
- Extend root TypeScript config
- Configure output directory
- Include Prisma client types

### Step 2: Define Database Schema

**2.1 Configure Prisma Schema Header**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2.2 Define Enums**

**Role Enum** (for User roles)
```prisma
enum Role {
  ADMIN
  RESEARCHER
  OFFICER
}
```

**DocumentStatus Enum** (for Document workflow status)
```prisma
enum DocumentStatus {
  PENDING
  PROCESSING
  PROCESSED
  FAILED
  REJECTED
}
```

**ChatMessageRole Enum** (for chat messages)
```prisma
enum ChatMessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

**ActionLogType Enum** (for audit trail)
```prisma
enum ActionLogType {
  DOCUMENT_UPLOADED
  DOCUMENT_PROCESSED
  DOCUMENT_REJECTED
  CHAT_QUERY
  USER_LOGIN
  USER_LOGOUT
  PERMISSION_CHANGED
  AI_COST_INCURRED
}
```

**2.3 Define Models**

**User Model**
```prisma
model User {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String      // Hashed password (bcrypt)
  name          String?
  role          Role        @default(RESEARCHER)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  uploadedDocuments Document[] @relation("DocumentUploader")
  chatSessions      ChatSession[]
  actionLogs        ActionLog[]
  
  @@index([email])
  @@index([role])
  @@map("users")
}
```

**Document Model**
```prisma
model Document {
  id              String          @id @default(uuid())
  title           String
  fileName        String          // Original file name
  filePath        String?         // Storage path
  fileSize        Int?            // Size in bytes
  mimeType        String?          // MIME type
  content         String?         // Extracted text content
  summary         String?         // AI-generated summary
  status          DocumentStatus  @default(PENDING)
  uploadedById    String
  processedAt     DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Relations
  uploader        User            @relation("DocumentUploader", fields: [uploadedById], references: [id])
  chatSessions    ChatSession[]   // Documents used in chat sessions
  documentChunks  DocumentChunk[] // For vector search/RAG
  
  @@index([uploadedById])
  @@index([status])
  @@index([createdAt])
  @@map("documents")
}
```

**DocumentChunk Model** (for RAG/vector search)
```prisma
model DocumentChunk {
  id          String    @id @default(uuid())
  documentId  String
  chunkIndex  Int       // Order of chunk in document
  content     String    // Text content of chunk
  embedding   String?   // Vector embedding (JSON string or base64)
  startChar   Int?      // Character position in original document
  endChar     Int?      // Character position in original document
  createdAt   DateTime  @default(now())
  
  // Relations
  document    Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  @@index([documentId])
  @@index([documentId, chunkIndex])
  @@map("document_chunks")
}
```

**ChatSession Model** (for conversation management)
```prisma
model ChatSession {
  id          String        @id @default(uuid())
  userId      String
  title       String?       // Auto-generated or user-provided
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    ChatMessage[]
  documents   Document[]    // Documents referenced in this session
  
  @@index([userId])
  @@index([createdAt])
  @@map("chat_sessions")
}
```

**ChatMessage Model**
```prisma
model ChatMessage {
  id            String            @id @default(uuid())
  sessionId     String
  role          ChatMessageRole
  content       String
  toolCalls     Json?             // Tool calls made by AI (if any)
  metadata      Json?             // Additional metadata (cost, tokens, etc.)
  createdAt     DateTime          @default(now())
  
  // Relations
  session       ChatSession       @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([sessionId])
  @@index([sessionId, createdAt])
  @@map("chat_messages")
}
```

**ActionLog Model** (for audit trail and dashboard)
```prisma
model ActionLog {
  id          String        @id @default(uuid())
  userId      String?
  type        ActionLogType
  description String
  metadata    Json?         // Additional context (document ID, cost, etc.)
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime      @default(now())
  
  // Relations
  user        User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([type])
  @@index([createdAt])
  @@map("action_logs")
}
```

**WorkflowTask Model** (for Inngest workflow tracking)
```prisma
model WorkflowTask {
  id            String    @id @default(uuid())
  documentId    String
  eventId       String?   // Inngest event ID
  status        String    // PENDING, RUNNING, COMPLETED, FAILED
  step          String?   // Current workflow step
  error         String?   // Error message if failed
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([documentId])
  @@index([status])
  @@index([createdAt])
  @@map("workflow_tasks")
}
```

**2.4 Add Model Relationships Summary**
- User → Documents (one-to-many)
- User → ChatSessions (one-to-many)
- User → ActionLogs (one-to-many)
- Document → DocumentChunks (one-to-many)
- Document → ChatSessions (many-to-many)
- ChatSession → ChatMessages (one-to-many)

### Step 3: Configure Indexes and Performance

**3.1 Primary Indexes** (already defined in models)
- User: email, role
- Document: uploadedById, status, createdAt
- DocumentChunk: documentId, (documentId, chunkIndex)
- ChatSession: userId, createdAt
- ChatMessage: sessionId, (sessionId, createdAt)
- ActionLog: userId, type, createdAt
- WorkflowTask: documentId, status, createdAt

**3.2 Composite Indexes**
- Consider adding composite indexes for common query patterns:
  - `(userId, createdAt)` for user activity logs
  - `(status, createdAt)` for document filtering

### Step 4: Create Prisma Client Export

**4.1 Create `src/index.ts`**
```typescript
export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
export type { Prisma } from '@prisma/client';
```

**4.2 Create Singleton Prisma Client Instance** (optional, for NestJS)
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 5: Set Up Database Scripts

**5.1 Migration Scripts**
- `db:migrate` - Run pending migrations
- `db:migrate:dev` - Create and apply new migration
- `db:migrate:deploy` - Apply migrations (production)
- `db:migrate:reset` - Reset database (dev only)

**5.2 Seed Script** (`prisma/seed.ts`)
- Create default admin user
- Create sample documents (optional)
- Create sample chat sessions (optional)

**5.3 Development Scripts**
- `db:push` - Push schema changes without migration (dev)
- `db:studio` - Open Prisma Studio GUI
- `db:format` - Format Prisma schema

### Step 6: Environment Configuration

**6.1 Required Environment Variables**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/alhuda_portal?schema=public"
```

**6.2 Optional Environment Variables**
```env
DATABASE_URL_NON_POOLING="postgresql://..." # For migrations
DIRECT_URL="postgresql://..." # For Prisma Migrate
```

### Step 7: TypeScript Configuration

**7.1 Create `tsconfig.json`**
- Extend root TypeScript config
- Set proper paths for Prisma client
- Configure output directory

**7.2 Export Types**
- Ensure Prisma types are exported
- Create utility types for common queries

### Step 8: Documentation

**8.1 Create `README.md`**
- Package overview
- Installation instructions
- Available scripts
- Schema documentation
- Migration guide
- Usage examples

**8.2 Schema Documentation**
- Document each model and field
- Explain relationships
- Provide query examples

## File Structure (Final)

```
packages/database/
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Package documentation
├── prisma/
│   ├── schema.prisma            # Prisma schema definition
│   ├── seed.ts                  # Database seed script
│   └── migrations/              # Migration files (auto-generated)
└── src/
    └── index.ts                 # Prisma client exports
```

## Dependencies

### Production Dependencies
- `@prisma/client`: ^5.0.0 (or latest)

### Development Dependencies
- `prisma`: ^5.0.0 (or latest)
- `typescript`: ^5.3.3 (from root)
- `@types/node`: Latest

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `db:generate` | `prisma generate` | Generate Prisma Client |
| `db:migrate` | `prisma migrate dev` | Create and apply migration |
| `db:migrate:deploy` | `prisma migrate deploy` | Apply migrations (production) |
| `db:push` | `prisma db push` | Push schema changes (dev) |
| `db:seed` | `ts-node prisma/seed.ts` | Seed database |
| `db:studio` | `prisma studio` | Open Prisma Studio |
| `db:format` | `prisma format` | Format schema file |
| `build` | `tsc` | Build TypeScript |
| `dev` | `tsc --watch` | Watch mode |

## Migration Strategy

1. **Initial Migration**: Create all models and relationships
2. **Development**: Use `db:push` for rapid iteration
3. **Production**: Use `db:migrate` for versioned migrations
4. **Seeding**: Run `db:seed` after initial migration

## Testing Checklist

- [ ] Prisma client generates successfully
- [ ] All models are accessible via Prisma client
- [ ] Relationships work correctly
- [ ] Indexes are created in database
- [ ] Migrations run without errors
- [ ] Seed script executes successfully
- [ ] TypeScript types are exported correctly
- [ ] Package can be imported in other monorepo packages

## Next Steps After Phase 2

1. **Phase 3**: Set up shared-types package with Zod schemas
2. **Phase 4**: Integrate database package into NestJS backend
3. **Phase 5**: Set up database connection in NestJS
4. **Phase 6**: Create database service/module in NestJS

## Notes

- Use UUIDs for all IDs (better for distributed systems)
- Use `@updatedAt` for automatic timestamp updates
- Use `onDelete: Cascade` for dependent records
- Use `onDelete: SetNull` for optional relationships
- Consider adding soft deletes if needed (add `deletedAt` field)
- Add validation at the application level (Zod schemas in shared-types)

## Success Criteria

✅ Package structure is complete  
✅ All models defined with proper types  
✅ Relationships established correctly  
✅ Indexes configured for performance  
✅ Prisma client exports working  
✅ TypeScript types available  
✅ Migrations can be run  
✅ Package can be imported by other packages  
✅ Documentation is complete  

