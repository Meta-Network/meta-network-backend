import { Module } from '@nestjs/common';
import { HexGridsService } from './hex-grids.service';
import { HexGridsController } from './hex-grids.controller';
import { HexGrid } from '../entities/hex-grid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HexGrid])],
  controllers: [HexGridsController],
  providers: [HexGridsService],
})
export class HexGridsModule {}
