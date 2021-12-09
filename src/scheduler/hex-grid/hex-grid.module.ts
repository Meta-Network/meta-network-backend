import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Arweave from 'arweave';
import fs from 'fs/promises';
import TestWeave from 'testweave-sdk';

import { HexGrid } from '../../entities/hex-grid.entity';
import { HexGridBatchTxEntity } from '../../entities/hex-grid-batch-tx.entity';
import { HexGridPendingEntity } from '../../entities/hex-grid-pending.entity';
import { HexGridTransactionReferenceEntity } from '../../entities/hex-grid-tx-ref.entity';
import { HexGridScheduler } from './hex-grid.scheduler';
import { HexGridStorageService } from './hex-grid-storage.service';
import { HexGridStorageArweaveProvider } from './hex-grid-storage-arweave.provider';
import * as InjectToken from './inject-token';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HexGrid,
      HexGridBatchTxEntity,
      HexGridPendingEntity,
      HexGridTransactionReferenceEntity,
    ]),
  ],
  providers: [
    {
      provide: InjectToken.Arweave,
      useFactory: (configService: ConfigService) =>
        Arweave.init({
          host: configService.get<string>('arweave.host', 'arweave.net'),
          port: configService.get<number>('arweave.port', 1984),
          protocol: configService.get<string>('arweave.protocol', 'https'),
          timeout: 20000,
          logging: false,
        }),
      inject: [ConfigService],
    },
    {
      provide: InjectToken.TestWeave,
      useFactory: async (arweave: Arweave, configService: ConfigService) => {
        if (!configService.get<boolean>('arweave.testnet', false)) {
          return null;
        }

        return await TestWeave.init(arweave);
      },
      inject: [InjectToken.Arweave, ConfigService],
    },
    {
      provide: InjectToken.WalletKey,
      useFactory: async (
        testWeave: TestWeave | null,
        configService: ConfigService,
      ) => {
        if (testWeave) {
          return testWeave.rootJWK;
        }

        return JSON.parse(
          await fs.readFile(configService.get('arweave.walletKeyPath'), {
            encoding: 'utf-8',
          }),
        );
      },
      inject: [InjectToken.TestWeave, ConfigService],
    },
    HexGridScheduler,
    HexGridStorageArweaveProvider,
    HexGridStorageService,
  ],
})
export class HexGridModule {}
