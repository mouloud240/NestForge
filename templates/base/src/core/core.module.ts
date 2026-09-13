import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module.js';
import { UserModule } from './user/user.module.js';
import { WebSocketModule } from './websocket/websocket.module.js';

@Module({
  imports: [UserModule, AuthenticationModule, WebSocketModule],
  exports: [UserModule, AuthenticationModule, WebSocketModule],
})
export class CoreModule {}
