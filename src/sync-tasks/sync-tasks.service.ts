import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Repository } from 'typeorm';

import {
  SyncTask,
  SyncTaskState,
  SyncTaskType,
} from '../entities/sync-task.entity';

export class SyncTaskCallbackResult {
  count: number;
  state? = SyncTaskState.SUCCESS;

  static success(count: number): SyncTaskCallbackResult {
    const result = new SyncTaskCallbackResult();
    result.count = count;
    return result;
  }
  static fail(count = 0): SyncTaskCallbackResult {
    const result = new SyncTaskCallbackResult();
    result.count = count;
    result.state = SyncTaskState.FAIL;
    return result;
  }
}

@Injectable()
export class SyncTasksService {
  private readonly logger = new Logger(SyncTasksService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SyncTask)
    private readonly syncTasksServiceRepository: Repository<SyncTask>,
  ) {}

  async findLastSuccessOneByType(type: SyncTaskType) {
    return await this.syncTasksServiceRepository.findOne(
      {
        type,
        state: SyncTaskState.SUCCESS,
      },
      {
        order: { id: 'DESC' },
      },
    );
  }

  async save(syncTask): Promise<SyncTask> {
    return await this.syncTasksServiceRepository.save(syncTask);
  }

  async syncUserProfile(
    callback: (modifiedAfter: Date) => Promise<SyncTaskCallbackResult>,
  ) {
    return this.sync(callback, SyncTaskType.USER_PROFILE);
  }

  async syncSiteInfo(
    callback: (modifiedAfter: Date) => Promise<SyncTaskCallbackResult>,
  ) {
    return this.sync(callback, SyncTaskType.SITE_INFO);
  }

  async sync(
    callback: (modifiedAfter: Date) => Promise<SyncTaskCallbackResult>,
    syncTaskType: SyncTaskType,
  ) {
    const lastSyncTask = await this.findLastSuccessOneByType(syncTaskType);
    const modifiedAfter = this.getModifiedAfter(lastSyncTask);
    const syncTaskEntity = await this.save({
      type: syncTaskType,
      state: SyncTaskState.DOING,
    });
    try {
      const result = await callback(modifiedAfter);
      syncTaskEntity.state = result.state;
      syncTaskEntity.count = result.count;
    } catch (err) {
      this.logger.error(err);
      syncTaskEntity.state = SyncTaskState.FAIL;
    }
    return await this.save(syncTaskEntity);
  }

  getModifiedAfter(lastSyncTask: SyncTask) {
    return lastSyncTask?.createdAt || dayjs('2021-01-01 00:00:00 GMT').toDate();
  }
}
