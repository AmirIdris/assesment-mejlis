import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/validation.pipe';
import {
  userListQuerySchema,
  userUpdateSchema,
  type UserListQuery,
  type UserUpdateInput,
  type UserResponse,
  Role,
} from '@repo/shared-types';

@Controller('users')
@UseGuards(SessionAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN' as Role)
  async findAll(@Query(new ZodValidationPipe(userListQuerySchema)) query: UserListQuery) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN' as Role)
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN' as Role)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userUpdateSchema)) updateDto: UserUpdateInput,
  ): Promise<UserResponse> {
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN' as Role)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}

