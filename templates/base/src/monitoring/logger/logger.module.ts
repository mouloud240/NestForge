import { Module } from '@nestjs/common';
import { AlsModule } from '../../common/modules/async_storage/als.module.js';
import { LoggerServiceBuilder } from './logger.service.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './logger.interceptor.js';

@Module({
  imports: [AlsModule],
  providers: [
    LoggerServiceBuilder,
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
  exports: [LoggerServiceBuilder],
})
export class LoggerModule {}
