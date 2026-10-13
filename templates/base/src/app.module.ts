import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { ConfigModule } from '@nestjs/config';
import mailConfig from './config/mail.config.js';
import redisConfig from './config/redis.config.js';
import authConfig from './config/auth.config.js';
import appConfig from './config/app.config.js';
import csrfConfig from './config/csrf.config.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';
import { SecurityModule } from './security/security.module.js';
import { CommonModule } from './common/modules/common.module.js';
import { CoreModule } from './core/core.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      // Optional: validationSchema accepts any Standard Schema (e.g. Zod); Joi needs v18+ and validationOptions.libraryOptions
      expandVariables: true,
      load: [mailConfig, redisConfig, authConfig, appConfig, csrfConfig],
    }),
    InfrastructureModule,
    MonitoringModule,
    SecurityModule,

    CommonModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
