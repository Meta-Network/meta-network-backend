import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import {
  SyncTask,
  SyncTaskState,
  SyncTaskType,
} from '../entities/sync-task.entity';
import { SyncTaskCallbackResult, SyncTasksService } from './sync-tasks.service';

describe('SyncTasksService', () => {
  let service: SyncTasksService;
  let repo: Repository<SyncTask>;
  let configService: ConfigService;

  const testConnectionName = 'testConn';
  beforeEach(async () => {
    const connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [SyncTask],
      synchronize: true,
      logging: false,
      name: testConnectionName,
    });
    repo = getRepository(SyncTask, testConnectionName);
    // console.log(getRepositoryToken(SyncTask) + ': ' + repo);
    configService = new ConfigService(null);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncTasksService,
        {
          provide: getRepositoryToken(SyncTask),
          useFactory: () => repo,
        },
        {
          provide: ConfigService,
          useFactory: () => configService,
        },
      ],
    }).compile();

    service = module.get<SyncTasksService>(SyncTasksService);
    return connection;
  });
  afterEach(async () => {
    await getConnection(testConnectionName).close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getModifiedAfter', () => {
    it('should return lastSyncTask.createdAt when it is defined', async () => {
      const lastSyncTask = new SyncTask();
      const lastSyncDate = dayjs('2021-08-08').toDate();
      lastSyncTask.createdAt = lastSyncDate;
      expect(service.getModifiedAfter(lastSyncTask)).toEqual(lastSyncDate);
    });

    it('should return "2021-01-01 00:00:00 GMT" when it is undefined', async () => {
      const lastSyncTask = new SyncTask();
      const lastSyncDate = dayjs('2021-01-01 00:00:00 GMT').toDate();
      expect(service.getModifiedAfter(lastSyncTask)).toEqual(lastSyncDate);
      expect(service.getModifiedAfter(null)).toEqual(lastSyncDate);
    });
  });

  describe('save', () => {
    it('should return the entity', async () => {
      const syncTask = new SyncTask();
      syncTask.type = SyncTaskType.USER_PROFILE;
      syncTask.state = SyncTaskState.TODO;
      const entity = await service.save(syncTask);
      expect(entity.id).toBeDefined();
      expect(entity.type).toBe(syncTask.type);
      expect(entity.state).toBe(syncTask.state);
      expect(entity.count).toBe(0);
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
    });

    it('should update the entity when it exists in the database', async () => {
      const syncTask = new SyncTask();
      syncTask.type = SyncTaskType.USER_PROFILE;
      syncTask.state = SyncTaskState.TODO;
      const entity = await service.save(syncTask);
      entity.count = 32;
      entity.state = SyncTaskState.SUCCESS;
      const entity2 = await service.save(entity);
      expect(entity2.id).toBe(entity.id);
      expect(entity2.type).toBe(entity.type);
      expect(entity2.state).toBe(entity.state);
      expect(entity2.count).toBe(entity.count);
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
    });
  });

  describe('findLastOneByType', () => {
    it('should return the last one when there are many entities with the type', async () => {
      await repo.save({
        type: SyncTaskType.SITE_INFO,
        state: SyncTaskState.SUCCESS,
      });
      const entity2 = await repo.save({
        type: SyncTaskType.SITE_INFO,
        state: SyncTaskState.DOING,
      });

      const syncTask = await service.findLastOneByType(SyncTaskType.SITE_INFO);
      expect(syncTask.id).toBe(2);
      expect(syncTask.type).toBe(SyncTaskType.SITE_INFO);
      expect(syncTask.state).toBe(SyncTaskState.DOING);
      expect(syncTask).toEqual(entity2);
    });
  });

  describe('syncUserProfile', () => {
    it('should return SyncTask entity with type "USER_PROFILE" ', async () => {
      let lastSyncDate;
      const syncTask = await service.syncUserProfile(async (modifiedAfter) => {
        lastSyncDate = modifiedAfter;
        return SyncTaskCallbackResult.success(22);
      });
      expect(syncTask.id).toBe(1);
      expect(syncTask.type).toBe(SyncTaskType.USER_PROFILE);
      expect(syncTask.state).toBe(SyncTaskState.SUCCESS);
      expect(syncTask.count).toBe(22);
      expect(lastSyncDate).toEqual(dayjs('2021-01-01 00:00:00 GMT').toDate());
    });

    it('should sync from "2021-01-01 00:00:00 GMT" if it is the first syncTask', async () => {
      let lastSyncDate;
      const syncTask = await service.syncUserProfile(async (modifiedAfter) => {
        lastSyncDate = modifiedAfter;
        return SyncTaskCallbackResult.success(22);
      });

      expect(lastSyncDate).toEqual(dayjs('2021-01-01 00:00:00 GMT').toDate());
    });
    it('should sync from the previous syncTask "createdAt" if it is not the first syncTask', async () => {
      let lastSyncDate;
      const previousSyncTask = await repo.save({
        type: SyncTaskType.USER_PROFILE,
        state: SyncTaskState.SUCCESS,
        count: 15,
      });
      await service.syncUserProfile(async (modifiedAfter) => {
        lastSyncDate = modifiedAfter;
        return SyncTaskCallbackResult.success(22);
      });

      expect(lastSyncDate).toEqual(previousSyncTask.createdAt);
    });

    it('should return SyncTask entity with state&count return by callback ', async () => {
      const syncTask = await service.syncUserProfile(async (modifiedAfter) => {
        return SyncTaskCallbackResult.success(22);
      });
      expect(syncTask.state).toBe(SyncTaskState.SUCCESS);
      expect(syncTask.count).toBe(22);

      const syncTaskFailed = await service.syncUserProfile(
        async (modifiedAfter) => {
          return SyncTaskCallbackResult.fail();
        },
      );
      expect(syncTaskFailed.state).toBe(SyncTaskState.FAIL);
      expect(syncTaskFailed.count).toBe(0);
    });
    it('should return SyncTask entity with state=failed and count = 0 when callback throw an error ', async () => {
      const syncTaskEx = await service.syncUserProfile(
        async (modifiedAfter) => {
          throw new ServiceUnavailableException();
        },
      );
      expect(syncTaskEx.state).toBe(SyncTaskState.FAIL);
      expect(syncTaskEx.count).toBe(0);
    });
  });
});
