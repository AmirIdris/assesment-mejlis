import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    Reflector,
    {
      provide: SessionAuthGuard,
      useFactory: (reflector: Reflector) => {
        return new SessionAuthGuard(reflector);
      },
      inject: [Reflector],
    },
    {
      provide: RolesGuard,
      useFactory: (reflector: Reflector) => {
        return new RolesGuard(reflector);
      },
      inject: [Reflector],
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

