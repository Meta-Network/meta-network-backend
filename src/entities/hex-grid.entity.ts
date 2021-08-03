import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index(['x', 'y', 'z'], { unique: true })
export class HexGrid {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, default: '' })
  hex_grid_name: string;
  @Column({ nullable: false })
  x: number;
  @Column({ nullable: false })
  y: number;
  @Column({ nullable: false })
  z: number;
  @Index({ unique: true })
  @Column({ nullable: false, default: 0 })
  user_id: number;
  @Index()
  @Column({ nullable: false, default: '' })
  username: string;
  /**
   * 子域名。二级域名
   *
   * @type {string}
   * @memberof HexGrid
   */
  @Index({ unique: true })
  @Column({ nullable: false, default: '' })
  subdomain: string;

  @Index()
  @Column({ nullable: false, default: 0 })
  meta_space_site_id: number;
  /**
   *配合外部接入直接使用
   *
   * @type {string}
   * @memberof HexGrid
   */
  @Index()
  @Column({ nullable: false, default: '' })
  meta_space_site_url: string;
  /**
   *预留： 外部接入的证明链接
   *
   * @type {string}
   * @memberof HexGrid
   */
  @Column({ nullable: false, default: '' })
  meta_space_site_proof_url: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
