import { metaNetworkGridsServerSign } from '@metaio/meta-signature-util';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Arweave from 'arweave';
import type { JWKInterface } from 'arweave/node/lib/wallet';
import TestWeave from 'testweave-sdk';

import type { IHexGridStorage } from './hex-grid-storage.interface';
import * as InjectToken from './inject-token';

@Injectable()
export class ArweaveHexGridStorageService {
  constructor(
    @Inject(InjectToken.Arweave)
    private arweave: Arweave,
    @Inject(InjectToken.TestWeave)
    private testWeave: TestWeave | null,
    @Inject(InjectToken.WalletKey)
    private walletKey: JWKInterface,
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

    const transaction = await this.createTransaction(JSON.stringify(metadata));

    await storage.updateHexGridsTransactionReference(
      transaction.id,
      pendings.map((pending) => pending.id),
    );
    await storage.clearPendings();

    this.testWeave?.mine();
  }

  async createTransaction(content: string) {
    const transaction = await this.arweave.createTransaction(
      {
        data: content,
      },
      this.walletKey,
    );

    await this.arweave.transactions.sign(transaction, this.walletKey);
    await this.arweave.transactions.post(transaction);

    return transaction;
  }
}
