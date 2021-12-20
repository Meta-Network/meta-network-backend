import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Connection } from 'typeorm';

import { HexGridStorageService } from './hex-grid-storage.service';
import { TypeOrmHexGridStorage } from './hex-grid-storage-typeorm';

@Injectable()
export class HexGridScheduler {
  private readonly logger = new Logger(HexGridScheduler.name);

  constructor(
    private connection: Connection,
    private storageService: HexGridStorageService,
  ) {}

  @Cron('0 */5 * * * *')
  async handleBatchUpload() {
    this.logger.log('triggered');

    await this.connection.transaction(async (manager) => {
      await this.storageService.uploadPendings(
        new TypeOrmHexGridStorage(manager),
      );
    });
  }
}
