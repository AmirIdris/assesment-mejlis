import { z } from 'zod';

/**
 * Role enum matching Prisma schema
 */
export const RoleEnum = z.enum(['ADMIN', 'USER']);
export type Role = z.infer<typeof RoleEnum>;
