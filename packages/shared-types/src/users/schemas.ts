import { z } from 'zod';
import { RoleEnum } from '../enums';

/**
 * User response schema
 */
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: RoleEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * User update schema (for admin)
 */
export const userUpdateSchema = z.object({
  role: RoleEnum.optional(),
  email: z.string().email().optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/**
 * User list query schema
 */
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: RoleEnum.optional(),
  search: z.string().optional(),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;

/**
 * User list response schema
 */
export const userListResponseSchema = z.object({
  users: z.array(userResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type UserListResponse = z.infer<typeof userListResponseSchema>;

