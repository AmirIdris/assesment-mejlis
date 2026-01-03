import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

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

    // Store user ID in session
    session.userId = user.id;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async signup(signupDto: SignupInput, session: any): Promise<User> {
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

    const user = await this.prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        role,
      },
    });

    // Store user ID in session
    session.userId = user.id;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
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

