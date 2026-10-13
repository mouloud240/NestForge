import { Module } from '@nestjs/common';
import { AlsModule } from './async_storage/als.module.js';
import { CsrfModule } from './csrf/csrf.module.js';

@Module({
  imports: [AlsModule, CsrfModule],
  exports: [AlsModule, CsrfModule],
})
export class CommonModule {}
