import { Module } from '@nestjs/common';
import { UserController } from './v1/user.controller.js';
import { UserService } from './v1/user.service.js';
import { USER_REPOSITORY } from './repository/user.respository-interface.js';
import { NoopUserRepository } from './repository/noop-user.repository.js';
import { UserResolver } from './user.resolver.js';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: NoopUserRepository,
    },
    UserResolver,
  ],
  exports: [UserService],
})
export class UserModule {}
