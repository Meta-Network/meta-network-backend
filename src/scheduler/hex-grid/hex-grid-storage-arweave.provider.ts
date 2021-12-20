import { Inject, Injectable } from '@nestjs/common';
import Arweave from 'arweave';
import type { JWKInterface } from 'arweave/node/lib/wallet';
import TestWeave from 'testweave-sdk';

import * as InjectToken from './inject-token';

@Injectable()
export class HexGridStorageArweaveProvider {
  constructor(
    @Inject(InjectToken.Arweave)
    private arweave: Arweave,
    @Inject(InjectToken.WalletKey)
    private walletKey: JWKInterface,
    @Inject(InjectToken.TestWeave)
    private testWeave: TestWeave | null,
  ) {}

  async createTransaction(content: string) {
    const transaction = await this.arweave.createTransaction(
      {
        data: content,
      },
      this.walletKey,
    );

    transaction.addTag('Content-Type', 'application/json');

    await this.arweave.transactions.sign(transaction, this.walletKey);

    const uploader = await this.arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
    }

    return transaction;
  }

  postProcess() {
    this.testWeave?.mine();
  }
}
