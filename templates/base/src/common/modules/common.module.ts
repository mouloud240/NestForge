import { Module } from '@nestjs/common';
import { AlsModule } from './async_storage/als.module.js';

@Module({
  imports: [AlsModule],
  exports: [AlsModule],
})
export class CommonModule {}
