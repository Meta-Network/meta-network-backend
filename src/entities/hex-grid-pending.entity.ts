import { Column, Entity, PrimaryColumn } from 'typeorm';

import { HexGrid } from './hex-grid.entity';

@Entity()
export class HexGridPendingEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'json' })
  properties: Partial<HexGrid>;
}
