import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class HexGridTransactionReferenceEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  tx: string;
}
