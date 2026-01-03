import { z } from 'zod';

/**
 * API error response schema
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int().positive(),
  timestamp: z.date(),
  path: z.string().optional(),
});

export type APIErrorResponse = z.infer<typeof apiErrorResponseSchema>;

/**
 * API success response schema (generic)
 */
export function apiSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
}

/**
 * Generic API success response type helper
 */
export type APISuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

/**
 * Pagination meta schema
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * WebSocket event schema
 */
export const websocketEventSchema = z.object({
  type: z.string().min(1, 'Event type is required'),
  payload: z.record(z.unknown()),
  timestamp: z.date(),
  userId: z.string().uuid().optional(),
});

export type WebSocketEvent = z.infer<typeof websocketEventSchema>;

/**
 * WebSocket event types
 */
export const websocketEventTypes = {
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_PROCESSED: 'document.processed',
  CHAT_MESSAGE: 'chat.message',
  ACTIVITY_LOG: 'activity.log',
  SYSTEM_NOTIFICATION: 'system.notification',
} as const;

export type WebSocketEventType =
  (typeof websocketEventTypes)[keyof typeof websocketEventTypes];

