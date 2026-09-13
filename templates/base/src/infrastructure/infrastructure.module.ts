import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module.js';
import { UploadModule } from './upload/upload.module.js';
import { QueueModule } from './queue/queue.module.js';
import { RedisModule } from 'nestjs-redis-client';
import redisConfig from '../config/redis.config.js';

@Module({
  imports: [
    DbModule,
    UploadModule,
    QueueModule.register(),
    RedisModule.registerAsync(redisConfig.asProvider()),
  ],
  exports: [RedisModule, QueueModule, UploadModule, DbModule],
})
export class InfrastructureModule {}
