import { Module } from '@nestjs/common';
import { HexGridsService } from './hex-grids.service';
import { HexGridsController } from './hex-grids.controller';
import { HexGrid } from '../entities/hex-grid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigBizModule } from '../config-biz/config-biz.module';
import { HexGridsGateway } from './hex-grids.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([HexGrid]), ConfigBizModule],
  controllers: [HexGridsController],
  providers: [HexGridsService, HexGridsGateway],
  exports: [HexGridsService, HexGridsGateway],
})
export class HexGridsModule {}
