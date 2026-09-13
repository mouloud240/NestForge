import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { WsConnectionsManagerGateway } from './ws-connections-manager.gateway.js';

@Module({
  imports: [UserModule],
  providers: [WsConnectionsManagerGateway],
  exports: [WsConnectionsManagerGateway],
})
export class WebSocketModule {}
