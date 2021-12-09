import { metaNetworkGridsServerSign } from '@metaio/meta-signature-util';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IHexGridStorage } from './hex-grid-storage.interface';
import { HexGridStorageArweaveProvider } from './hex-grid-storage-arweave.provider';

@Injectable()
export class HexGridStorageService {
  constructor(
    private arweave: HexGridStorageArweaveProvider,
    private configService: ConfigService,
  ) {}

  async uploadPendings(storage: IHexGridStorage) {
    const pendings = await storage.getPendings();
    if (pendings.length === 0) {
      return;
    }

    const items = [];

    for (const { id, properties } of pendings) {
      const item = {
        ...properties,
        id,
      };

      const referenceTx = await storage.getReferencedTx(id);
      if (referenceTx) {
        Object.assign(item, {
          previousTx: referenceTx,
        });
      }

      items.push(item);
    }

    const metadata = metaNetworkGridsServerSign.generate(
      this.configService.get('metaSignature.serverKeys'),
      this.configService.get('metaSignature.serverDomain'),
      items,
    );

    const previousBatchTx = await storage.getPreviousBatchTx();
    if (previousBatchTx) {
      Object.assign(metadata, { previousBatchTx });
    }

    const transaction = await this.arweave.createTransaction(
      JSON.stringify(metadata),
    );

    await storage.updateHexGridsTransactionReference(
      transaction.id,
      pendings.map((pending) => pending.id),
    );
    await storage.clearPendings();

    this.arweave.postProcess();
  }
}
