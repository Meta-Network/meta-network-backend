import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Connection } from 'typeorm';

import { ArweaveHexGridStorageService } from './hex-grid-storage-arweave.service';
import { TypeOrmHexGridStorage } from './hex-grid-storage-typeorm';

@Injectable()
export class HexGridScheduler {
  constructor(
    private connection: Connection,
    private storageService: ArweaveHexGridStorageService,
  ) {}

  @Cron('0 */5 * * * *')
  async handleBatchUpload() {
    await this.connection.transaction(async (manager) => {
      await this.storageService.uploadPendings(
        new TypeOrmHexGridStorage(manager),
      );
    });
  }
}
