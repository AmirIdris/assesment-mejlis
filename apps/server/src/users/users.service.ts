import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  userListQuerySchema,
  userUpdateSchema,
  type UserListQuery,
  type UserUpdateInput,
  type UserResponse,
} from '@repo/shared-types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: UserListQuery) {
    const validated = userListQuerySchema.parse(query);
    const { page, limit, role, search } = validated;
    const skip = (page - 1) * limit;

    const where: {
      role?: string;
      OR?: Array<{
        email?: { contains: string; mode?: 'insensitive' | 'default' };
      }>;
    } = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where: where as any }),
    ]);

    return {
      users: users.map(
        (user: {
          id: string;
          email: string;  
          role: string;
          createdAt: Date;
          updatedAt: Date;
        }): UserResponse => ({
          id: user.id,
          email: user.email,
          
          role: user.role as 'ADMIN' | 'USER',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserResponse;
  }

  async update(id: string, updateDto: UserUpdateInput): Promise<UserResponse> {
    const validated = userUpdateSchema.parse(updateDto);

    const user = await this.prisma.user.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserResponse;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

