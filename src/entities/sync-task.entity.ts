import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AutoDateEntity } from './auto-date.entity';

export enum SyncTaskType {
  DEFAULT = 0,
  USER_PROFILE = 1,
  SITE_INFO = 2,
}

export enum SyncTaskState {
  TODO = 0,
  DOING = 1,
  SUCCESS = 2,
  FAIL = 3,
}

@Index(['type', 'state'])
@Entity()
export class SyncTask extends AutoDateEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Index()
  @Column({
    nullable: false,
    // type: 'enum',
    // enum: SyncTaskType,
    // default: SyncTaskType.DEFAULT,
    default: 0,
    comment: '同步任务类型：0 - 默认; 1 - 用户信息; 2 - 站点信息',
  })
  type: SyncTaskType;

  @Column({
    nullable: false,
    // type: 'enum',
    // enum: SyncTaskState,
    // default: SyncTaskState.TODO,
    default: 0,
    comment: '同步任务状态：0 - 待执行; 1 - 执行中; 2 - 成功; 3 - 失败',
  })
  state: SyncTaskState;
  @Column({
    nullable: false,

    default: 0,
    comment: '同步条数',
  })
  count: number;
}
