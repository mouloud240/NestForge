import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { AlsModule } from './async_storage/als.module.js';
import { DataLoaderModule } from './dataloader/dataloader.module.js';

@Module({
  imports: [MailerModule, AlsModule, DataLoaderModule],
  exports: [MailerModule, AlsModule, DataLoaderModule],
})
export class CommonModule {}
