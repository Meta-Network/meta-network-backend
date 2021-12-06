import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexGridBatchTxEntity } from 'src/entities/hex-grid-batch-tx.entity';
import { HexGridPendingEntity } from 'src/entities/hex-grid-pending.entity';
import { HexGridTransactionReferenceEntity } from 'src/entities/hex-grid-tx-ref.entity';

import { ConfigBizModule } from '../config-biz/config-biz.module';
import { HexGrid } from '../entities/hex-grid.entity';
import { HexGridsController } from './hex-grids.controller';
import { HexGridsGateway } from './hex-grids.gateway';
import { HexGridsService } from './hex-grids.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HexGrid,
      HexGridBatchTxEntity,
      HexGridPendingEntity,
      HexGridTransactionReferenceEntity,
    ]),
    ConfigBizModule,
  ],
  controllers: [HexGridsController],
  providers: [HexGridsService, HexGridsGateway],
  exports: [HexGridsService, HexGridsGateway],
})
export class HexGridsModule {}
