import { EntityManager } from 'typeorm';

import { HexGridBatchTxEntity } from '../../entities/hex-grid-batch-tx.entity';
import { HexGridPendingEntity } from '../../entities/hex-grid-pending.entity';
import { HexGridTransactionReferenceEntity } from '../../entities/hex-grid-tx-ref.entity';
import { IHexGridStorage } from './hex-grid-storage.interface';

export class TypeOrmHexGridStorage implements IHexGridStorage {
  constructor(protected entityManager: EntityManager) {}

  async getPendings() {
    return await this.entityManager.find(HexGridPendingEntity);
  }
  async clearPendings() {
    await this.entityManager.clear(HexGridPendingEntity);
  }

  async getReferencedTx(id: number) {
    const reference = await this.entityManager.findOne(
      HexGridTransactionReferenceEntity,
      id,
    );

    return reference?.tx;
  }

  async getPreviousBatchTx() {
    const previousTx = await this.entityManager.findOne(HexGridBatchTxEntity, {
      order: { id: 'DESC' },
    });

    return previousTx?.tx;
  }

  async updateHexGridsTransactionReference(
    txId: string,
    hexGridIds: Array<number>,
  ) {
    await this.entityManager.save(HexGridBatchTxEntity, { tx: txId });

    for (const id of hexGridIds) {
      await this.entityManager.save(HexGridTransactionReferenceEntity, {
        id,
        tx: txId,
      });
    }
  }
}
