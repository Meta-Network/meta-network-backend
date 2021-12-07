import { Module } from '@nestjs/common';

import { HexGridModule } from './hex-grid/hex-grid.module';

@Module({
  imports: [HexGridModule],
})
export class SchedulerModule {}
