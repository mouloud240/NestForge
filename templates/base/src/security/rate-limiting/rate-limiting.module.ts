import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from '../../config/app.config.js';
import redisConfig from '../../config/redis.config.js';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { HttpThrottlerGuard } from './http-throttler.guard.js';
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY, redisConfig.KEY],
      useFactory: (
        configService: ConfigType<typeof appConfig>,
        redisConf: ConfigType<typeof redisConfig>,
      ) => ({
        storage: new ThrottlerStorageRedisService({
          host: redisConf.host,
          port: redisConf.port,
          db: 2,
        }),
        throttlers: [
          {
            name: 'global',
            limit: configService.throttler.limit,
            ttl: configService.throttler.ttl,
            blockDuration: configService.throttler.blockDuration,
          },
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
  ],
  exports: [ThrottlerModule],
})
export class RateLimitingModule {}
