import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { ConfigModule, ConfigType } from '@nestjs/config';
import mailConfig from './config/mail.config.js';
import redisConfig from './config/redis.config.js';
import authConfig from './config/auth.config.js';
import appConfig from './config/app.config.js';
import csrfConfig from './config/csrf.config.js';
import graphqlConfig from './config/graphql.config.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';
import { SecurityModule } from './security/security.module.js';
import { CommonModule } from './common/modules/common.module.js';
import { CoreModule } from './core/core.module.js';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserDataLoader } from './common/modules/dataloader/user.dataloader.js';
import { IDataLoaders } from './common/modules/dataloader/dataloader.interface.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      // Optional: validationSchema accepts any Standard Schema (e.g. Zod); Joi needs v18+ and validationOptions.libraryOptions
      expandVariables: true,
      load: [mailConfig, redisConfig, authConfig, appConfig, csrfConfig, graphqlConfig],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [CommonModule],
      useFactory: (
        graphqlConfiguration: ConfigType<typeof graphqlConfig>,
        userDataLoader: UserDataLoader,
      ) => ({
        ...graphqlConfiguration,
        // Override context to inject DataLoaders per request
        context: ({ req, res }) => {
          const loaders: IDataLoaders = {
            userLoader: userDataLoader.createLoader(),
          };
          return { req, res, loaders };
        },
      }),
      inject: [graphqlConfig.KEY, UserDataLoader],
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
