import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AutoDateEntity } from './auto-date.entity';
import { HexGridTransactionReferenceEntity } from './hex-grid-tx-ref.entity';

@Entity()
@Index(['x', 'y', 'z'], { unique: true })
export class HexGrid extends AutoDateEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    description: '站点名称。和CMS管理的站点名称保持一致',
  })
  @Column({
    name: 'site_name',
    nullable: false,
    default: '',
    comment: '和CMS管理的站点名称保持一致',
  })
  siteName: string;
  @ApiProperty({
    description: '地块的X轴坐标',
  })
  @Column({ nullable: false })
  x: number;
  @ApiProperty({
    description: '地块的Y轴坐标',
  })
  @Column({ nullable: false })
  y: number;
  @ApiProperty({
    description: '地块的Z轴坐标',
  })
  @Column({ nullable: false })
  z: number;
  @ApiProperty({
    description: '地块拥有者ID',
  })
  @Index({ unique: true })
  @Column({ name: 'user_id', nullable: false, default: 0 })
  userId: number;
  @ApiProperty({
    description: '地块拥有者用户名',
  })
  @Index()
  @Column({
    nullable: false,
    default: '',
    comment: '作为社交网络 @ 的身份定位',
  })
  username: string;
  @ApiProperty({
    description: '地块拥有者用户昵称',
  })
  @Index()
  @Column({
    name: 'user_nickname',
    nullable: false,
    default: '',
    comment: '用户昵称，作为搜索条件',
  })
  userNickname: string;
  @ApiProperty({
    description: '地块拥有者用户个人简介',
  })
  @Column({
    name: 'user_bio',
    nullable: false,
    default: '',
    comment: '用户简介',
  })
  userBio: string;
  @ApiProperty({
    description: '地块拥有者用户头像',
  })
  @Column({
    name: 'user_avatar',
    nullable: false,
    default: '',
    comment: '用户虚拟形象',
  })
  userAvatar: string;
  /**
   * 子域名。二级域名
   *
   * @type {string}
   * @memberof HexGrid
   */
  @ApiProperty({
    description:
      '子域名。和username可以不同。配合系统分配的域名使用。如果用户彻底替换了域名，这个也要保留，以后可以回退到系统分配的域名',
  })
  @Index()
  @Column({
    nullable: false,
    default: '',
    comment:
      '子域名。和 username 可以不同。配合系统分配的域名使用。如果用户彻底替换了域名，这个也要保留，以后可以回退到系统分配的域名',
  })
  subdomain: string;
  @ApiProperty({
    description: '关联站点ID',
  })
  @Index()
  @Column({
    name: 'meta_space_site_id',
    nullable: false,
    default: 0,
    comment: '关联站点ID。站点管理相关 API',
  })
  metaSpaceSiteId: number;
  @ApiProperty({
    description: '关联站点URL',
  })
  @Index()
  @Column({
    name: 'meta_space_site_url',
    nullable: false,
    default: '',
    comment:
      '站点URL。违反了第三范式。在这张表起到索引作用。需要和 CMS 服务同步站点信息',
  })
  metaSpaceSiteUrl: string;
  @ApiProperty({
    description: '外部关联站点所有权证明URL',
  })
  @Column({
    name: 'meta_space_site_proof_url',
    nullable: false,
    default: '',
    comment: '站点归属验证用URL。用于后续外部站点接入验证所有权',
  })
  metaSpaceSiteProofUrl: string;
  @ApiProperty({
    description: '地块拥有者的邀请者ID',
  })
  @Index()
  @Column({ name: 'inviter_user_id', nullable: false, default: 0 })
  inviterUserId: number;

  @OneToOne(() => HexGridTransactionReferenceEntity, reference => reference.id)
  reference: HexGridTransactionReferenceEntity;
}
