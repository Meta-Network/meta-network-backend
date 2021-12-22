import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { HexGrid } from './hex-grid.entity';

@Entity()
export class HexGridTransactionReferenceEntity {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => HexGrid, { cascade: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id' })
  hexgrid: HexGrid;

  @Column()
  tx: string;
}
