import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { HexGrid } from './hex-grid.entity';

@Entity()
export class HexGridTransactionReferenceEntity {
  @OneToOne(() => HexGrid, { primary: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id' })
  id: number;

  @Column()
  tx: string;
}
