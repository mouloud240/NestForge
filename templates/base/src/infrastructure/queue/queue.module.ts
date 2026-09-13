import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { QUEUE_NAME } from '../../common/constants/queues.js';
import redisConfig from '../../config/redis.config.js';
import { UploadModule } from '../upload/upload.module.js';
import { EmailModule } from '../../common/modules/email/email.module.js';
import { loadProcessors } from './processor.loader.js';

@Global()
@Module({})
export class QueueModule {
  static register(): DynamicModule {
    const processors = loadProcessors();

    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          useFactory: (configService: ConfigType<typeof redisConfig>) => {
            const redisHost = configService.host;
            const redisPort = configService.port;
            const redisUrl = `redis://${redisHost}:${redisPort}`;
            return {
              connection: {
                host: redisHost,
                port: redisPort,
                url: redisUrl,
                db: 3,
              },
            };
          },
          inject: [redisConfig.KEY],
        }),
        BullModule.registerQueue(
          ...Object.values(QUEUE_NAME).map((queueName) => ({
            name: queueName,
          })),
        ),
        UploadModule,
        EmailModule,
      ],
      providers: processors,
      exports: [BullModule],
    };
  }
}
