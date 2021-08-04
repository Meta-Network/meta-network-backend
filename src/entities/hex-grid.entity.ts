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
  @Column({
    nullable: false,
    default: '',
    comment: '和 CMS 管理的站点名称保持一致',
  })
  site_name: string;
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
  @Column({
    nullable: false,
    default: '',
    comment: '作为社交网络 @ 的身份定位',
  })
  username: string;
  /**
   * 子域名。二级域名
   *
   * @type {string}
   * @memberof HexGrid
   */
  @Index({ unique: true })
  @Column({
    nullable: false,
    default: '',
    comment:
      '子域名。和 username 可以不同。配合系统分配的域名使用。如果用户彻底替换了域名，这个也要保留，以后可以回退到系统分配的域名',
  })
  subdomain: string;

  @Index()
  @Column({
    nullable: false,
    default: 0,
    comment: '关联站点ID。站点管理相关 API',
  })
  meta_space_site_id: number;
  /**
   *配合外部接入直接使用
   *
   * @type {string}
   * @memberof HexGrid
   */
  @Index()
  @Column({
    nullable: false,
    default: '',
    comment:
      '站点URL。违反了第三范式。在这张表起到索引作用。需要和 CMS 服务同步站点信息',
  })
  meta_space_site_url: string;
  /**
   *预留： 外部接入的证明链接
   *
   * @type {string}
   * @memberof HexGrid
   */
  @Column({
    nullable: false,
    default: '',
    comment: '站点归属验证用URL。用于后续外部站点接入验证所有权',
  })
  meta_space_site_proof_url: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
