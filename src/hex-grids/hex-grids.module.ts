import { Module } from '@nestjs/common';
import { HexGridsService } from './hex-grids.service';
import { HexGridsController } from './hex-grids.controller';

@Module({
  controllers: [HexGridsController],
  providers: [HexGridsService]
})
export class HexGridsModule {}
