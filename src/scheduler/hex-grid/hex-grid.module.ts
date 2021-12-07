import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Arweave from 'arweave';
import fs from 'fs/promises';
import { HexGrid } from 'src/entities/hex-grid.entity';
import { HexGridBatchTxEntity } from 'src/entities/hex-grid-batch-tx.entity';
import { HexGridPendingEntity } from 'src/entities/hex-grid-pending.entity';
import { HexGridTransactionReferenceEntity } from 'src/entities/hex-grid-tx-ref.entity';
import TestWeave from 'testweave-sdk';

import { HexGridScheduler } from './hex-grid.scheduler';
import { ArweaveHexGridStorageService } from './hex-grid-storage-arweave.service';
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
    ArweaveHexGridStorageService,
  ],
})
export class HexGridModule {}
