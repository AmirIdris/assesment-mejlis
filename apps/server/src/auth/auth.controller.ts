import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/validation.pipe';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { Public } from './decorators/public.decorator';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@repo/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const user = await this.authService.signup(signupDto, req.session);
    return { user };
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  async logout(@Req() req: Request) {
    await this.authService.logout(req.session);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getCurrentUser(@Req() req: Request) {
    const user = await this.authService.getCurrentUser(req.session.userId!);
    return { user };
  }
}

