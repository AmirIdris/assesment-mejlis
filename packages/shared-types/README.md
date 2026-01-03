# @repo/shared-types

Shared Zod validation schemas and TypeScript types for the Al-Huda Knowledge & Workflow Portal. This package ensures type safety and consistent validation between the NestJS backend and Next.js frontend.

## Overview

This package contains:
- Zod validation schemas for all API requests and responses
- TypeScript types inferred from Zod schemas
- Enum definitions matching Prisma schema
- Reusable validation utilities

## Installation

The package is automatically available in the monorepo workspace. To install dependencies:

```bash
npm install
```

## Available Schemas

### Enums

- `RoleEnum` - User roles (ADMIN, RESEARCHER, OFFICER)
- `DocumentStatusEnum` - Document processing status
- `ChatMessageRoleEnum` - Chat message roles (USER, ASSISTANT, SYSTEM)
- `ActionLogTypeEnum` - Action log event types

### Authentication

- `loginSchema` - User login validation
- `signupSchema` - User registration validation
- `jwtPayloadSchema` - JWT token payload structure
- `authResponseSchema` - Authentication response

### Documents

- `documentUploadSchema` - Document upload validation
- `documentUpdateSchema` - Document update validation
- `documentQuerySchema` - Document list query/filtering
- `documentResponseSchema` - Document response structure
- `documentListResponseSchema` - Paginated document list

### Chat

- `chatMessageSchema` - Chat message structure
- `chatMessageCreateSchema` - Create new chat message
- `chatSessionCreateSchema` - Create new chat session
- `chatSessionResponseSchema` - Chat session with messages
- `chatStreamChunkSchema` - Streaming response chunks

### API

- `apiErrorResponseSchema` - Standard error response
- `apiSuccessResponseSchema` - Generic success response helper
- `paginationMetaSchema` - Pagination metadata
- `websocketEventSchema` - WebSocket event structure

### Users

- `userResponseSchema` - User object structure
- `userUpdateSchema` - User update validation
- `userListQuerySchema` - User list query/filtering
- `userListResponseSchema` - Paginated user list

### Dashboard

- `dashboardStatsSchema` - Dashboard statistics
- `activityLogResponseSchema` - Activity log entry

## Usage Examples

### Frontend (Next.js)

```typescript
import { loginSchema, type LoginInput } from '@repo/shared-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    // data is validated and typed
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

### Backend (NestJS)

```typescript
import { loginSchema, type LoginInput } from '@repo/shared-types';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() body: unknown) {
    // Validate request body
    const validated = loginSchema.parse(body);
    // validated is now typed as LoginInput
    
    // Your login logic here
    return { accessToken: '...', user: {...} };
  }
}
```

### Type Inference

```typescript
import { documentResponseSchema, type DocumentResponse } from '@repo/shared-types';

// Type is automatically inferred
type Document = z.infer<typeof documentResponseSchema>;

// Or use the exported type
const document: DocumentResponse = {
  id: '...',
  title: '...',
  // TypeScript will enforce all required fields
};
```

### Validation with Error Handling

```typescript
import { signupSchema } from '@repo/shared-types';

const result = signupSchema.safeParse(userInput);

if (!result.success) {
  // Handle validation errors
  result.error.errors.forEach((err) => {
    console.error(`${err.path.join('.')}: ${err.message}`);
  });
} else {
  // result.data is typed and validated
  const validatedInput = result.data;
}
```

### API Response Types

```typescript
import {
  apiSuccessResponseSchema,
  documentResponseSchema,
  type APISuccessResponse,
  type DocumentResponse,
} from '@repo/shared-types';

// Create typed response schema
const responseSchema = apiSuccessResponseSchema(documentResponseSchema);

// Use in API handler
function getDocument(id: string): Promise<APISuccessResponse<DocumentResponse>> {
  return fetch(`/api/documents/${id}`).then((res) => res.json());
}
```

### WebSocket Events

```typescript
import {
  websocketEventSchema,
  websocketEventTypes,
  type WebSocketEvent,
} from '@repo/shared-types';

function handleWebSocketMessage(message: unknown) {
  const event = websocketEventSchema.parse(message);
  
  switch (event.type) {
    case websocketEventTypes.DOCUMENT_UPLOADED:
      // Handle document upload event
      break;
    case websocketEventTypes.CHAT_MESSAGE:
      // Handle chat message event
      break;
  }
}
```

## Schema Design Principles

- **Type Safety**: All schemas export both Zod schemas and TypeScript types
- **Validation**: Use Zod's built-in validators (email, uuid, min, max, etc.)
- **Reusability**: Base schemas are composed into more complex schemas
- **Consistency**: Enum values match Prisma schema exactly
- **Flexibility**: Optional fields are explicitly marked
- **Error Handling**: Use `.safeParse()` for graceful error handling

## Best Practices

1. **Always validate user input** using Zod schemas before processing
2. **Use type inference** (`z.infer<typeof schema>`) for TypeScript types
3. **Handle validation errors** gracefully with `.safeParse()`
4. **Compose schemas** for complex validation requirements
5. **Export types separately** for cleaner imports

## Date Handling

Zod schemas use `z.date()` for date fields. When working with JSON APIs:

- **Input**: Convert ISO strings to Date objects using `z.preprocess()`
- **Output**: Dates are serialized to ISO strings automatically by JSON.stringify()

Example:
```typescript
const dateSchema = z.preprocess(
  (val) => (typeof val === 'string' ? new Date(val) : val),
  z.date()
);
```

## Testing

Schemas can be tested directly:

```typescript
import { loginSchema } from '@repo/shared-types';

describe('loginSchema', () => {
  it('should validate correct input', () => {
    const input = {
      email: 'user@example.com',
      password: 'password123',
    };
    expect(() => loginSchema.parse(input)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const input = {
      email: 'invalid-email',
      password: 'password123',
    };
    expect(() => loginSchema.parse(input)).toThrow();
  });
});
```

## License

Private project for AAIAHC assessment.

