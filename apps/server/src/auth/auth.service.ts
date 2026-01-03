import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
  type User,
} from '@repo/shared-types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginInput, session: any): Promise<User> {
    const validated = loginSchema.parse(loginDto);
    const user = await this.validateUser(validated.email, validated.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Store user info in session
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async signup(signupDto: SignupInput, session: any): Promise<User> {
    try {
      const validated = signupSchema.parse(signupDto);

      const existingUser = await this.prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Check if this is the first user (becomes ADMIN)
      const userCount = await this.prisma.user.count();
      const role = userCount === 0 ? 'ADMIN' : 'USER';

      const passwordHash = await bcrypt.hash(validated.password, 10);

      // Create user
      const createdUser = await this.prisma.user.create({
        data: {
          email: validated.email,
          passwordHash,
          role,
        },
      });

      if (!createdUser || !createdUser.id) {
        throw new Error('Failed to create user - Prisma returned invalid data');
      }

      // Extract only the fields we need
      const user: User = {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      };

      // Store user info in session if session exists
      if (session) {
        session.userId = user.id;
        session.email = user.email;
        session.role = user.role;
      }

      return user;
    } catch (error) {
      console.error('Signup error details:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      // Re-throw known exceptions
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // Wrap Prisma errors
      throw new Error(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(session: any): Promise<void> {
    return new Promise((resolve, reject) => {
      session.destroy((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}

