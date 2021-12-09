import { HexGridPendingEntity } from '../../entities/hex-grid-pending.entity';

export interface IHexGridStorage {
  getPendings(): Promise<Array<HexGridPendingEntity>>;
  clearPendings(): Promise<void>;

  getReferencedTx(id: number): Promise<string | undefined>;
  getPreviousBatchTx(): Promise<string | undefined>;

  updateHexGridsTransactionReference(
    txId: string,
    hexGridIds: Array<number>,
  ): Promise<void>;
}
