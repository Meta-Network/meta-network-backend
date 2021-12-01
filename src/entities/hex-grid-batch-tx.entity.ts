import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HexGridBatchTxEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tx: string;
}
