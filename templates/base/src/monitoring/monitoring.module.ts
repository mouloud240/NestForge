import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { LoggerModule } from './logger/logger.module.js';

@Module({
  imports: [HealthModule, LoggerModule],
  exports: [HealthModule, LoggerModule],
})
export class MonitoringModule {}
