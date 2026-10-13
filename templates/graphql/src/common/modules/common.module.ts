import { Module } from '@nestjs/common';
import { AlsModule } from './async_storage/als.module.js';
import { DataLoaderModule } from './dataloader/dataloader.module.js';

@Module({
  imports: [AlsModule, DataLoaderModule],
  exports: [AlsModule, DataLoaderModule],
})
export class CommonModule {}
