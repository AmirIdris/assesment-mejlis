import { z } from 'zod';
import { RoleEnum } from '../enums';

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Signup request schema
 * Note: Role is automatically assigned (first user = ADMIN, others = RESEARCHER)
 */
export const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })
  .refine((data) => data.password.length >= 8, {
    message: 'Password must be at least 8 characters',
    path: ['password'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * User object schema (for auth responses)
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: RoleEnum,
});

export type User = z.infer<typeof userSchema>;

/**
 * Auth response schema (session-based, no token)
 */
export const authResponseSchema = z.object({
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

