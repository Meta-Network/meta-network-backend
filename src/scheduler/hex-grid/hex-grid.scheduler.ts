import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Connection } from 'typeorm';

import { TypeOrmHexGridStorage } from './hex-grid-storage-typeorm';
import { HexGridStorageService } from './hex-grid-storage.service';

@Injectable()
export class HexGridScheduler {
  constructor(
    private connection: Connection,
    private storageService: HexGridStorageService,
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
