import { Controller, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { SessionAuthGuard } from '../../authentication/guards/session.guard.js';

@Controller('user')
@UseGuards(SessionAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
}
