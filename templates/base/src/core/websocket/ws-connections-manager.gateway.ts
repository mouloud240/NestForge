import { Inject, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { parse } from 'cookie';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'nestjs-redis-client';
import { User } from '../user/entities/user.entity.js';
import { UserService } from '../user/v1/user.service.js';
import { AuthConfig } from '../../config/interfaces/auth-config.interface.js';

@WebSocketGateway()
export class WsConnectionsManagerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(WsConnectionsManagerGateway.name);
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(RedisService)
  private readonly redisService: RedisService;
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnect`);
    client.rooms.clear();
  }

  async handleConnection(client: Socket) {
    const sessionId = this.extractSessionIdFromSocket(client);
    if (!sessionId) {
      this.logger.log('No session cookie provided');
      client.disconnect(true);
      return;
    }
    const userId = await this.resolveUserIdFromSession(sessionId);
    if (!userId) {
      this.logger.log('Invalid session');
      client.disconnect(true);
      return;
    }
    const user = await this.userService.findById(userId);
    if (!user) {
      this.logger.log('User not found');
      client.disconnect(true);
      return;
    }
    client['user'] = user;
    await client.join(`user_${user.id}`);
  }

  private extractSessionIdFromSocket(client: Socket): string | null {
    const rawCookie = client.handshake.headers.cookie;
    if (!rawCookie) {
      return null;
    }
    const authConfig = this.configService.get<AuthConfig>('auth');
    const cookieName = authConfig?.session?.name ?? 'sid';
    const parsed = parse(rawCookie);
    const value = parsed[cookieName];
    return value ?? null;
  }

  private async resolveUserIdFromSession(
    sessionId: string,
  ): Promise<string | null> {
    try {
      // ponytail: default connect-redis key prefix. If you change the store prefix, update this.
      const raw = await this.redisService.get<string>(`sess:${sessionId}`);
      if (!raw) {
        return null;
      }
      const session = JSON.parse(raw) as { userId?: string };
      return session.userId ?? null;
    } catch (e) {
      this.logger.error('Session resolution error', e);
      return null;
    }
  }

  getUserFromSocket(client: Socket): User {
    return client['user'] as User;
  }
}
