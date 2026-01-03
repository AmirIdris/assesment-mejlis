import { Controller, Post, Body, Get, Req, Inject } from '@nestjs/common';
import { Request } from 'express-serve-static-core';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/validation.pipe';
import { Public } from './decorators/public.decorator';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@repo/shared-types';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) loginDto: LoginInput,
    @Req() req: Request,
  ) {
    const user = await this.authService.login(loginDto, req.session);
    return { user };
  }

  @Public()
  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) signupDto: SignupInput,
    @Req() req: Request,
  ) {
    try {
      const user = await this.authService.signup(signupDto, req.session);
      if (!user) {
        throw new Error('User creation failed');
      }
      return { user };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    await this.authService.logout(req.session);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const user = await this.authService.getCurrentUser(req.session.userId!);
    return { user };
  }
}

