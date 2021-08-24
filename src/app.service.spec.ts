import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  ReadPacket,
} from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';

import { AppService } from './app.service';
import { ConfigBizService } from './config-biz/config-biz.service';
import { UCenterMsClientMethod } from './constants';
import { HexGrid } from './entities/hex-grid.entity';
import { SyncTaskType } from './entities/sync-task.entity';
import { HexGridsService } from './hex-grids/hex-grids.service';
import { SyncTasksService } from './sync-tasks/sync-tasks.service';

class MockClientProxy extends ClientProxy {
  protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T> {
    throw new Error('Method not implemented.');
  }
  close() {
    // do nothing
  }
  async connect() {
    // do nothing
  }
  publish(packet, callback) {
    return () => {
      // do nothing
    };
  }
}

describe('AppService', () => {
  let appService: AppService;
  let ucenterMsClient: ClientProxy;
  const configBizService = new ConfigBizService(null);
  const configService = new ConfigService();
  const hexGridsService = new HexGridsService(null, null, null);
  const syncTasksService = new SyncTasksService(null, null);
  beforeEach(async () => {
    ucenterMsClient = new MockClientProxy();
    const app: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [
        AppService,

        {
          provide: 'UCENTER_MS_CLIENT',
          useFactory: () => ucenterMsClient,
        },
        {
          provide: ConfigBizService,
          useFactory: () => configBizService,
        },
        {
          provide: ConfigService,
          useFactory: () => configService,
        },
        {
          provide: HexGridsService,
          useFactory: () => hexGridsService,
        },
        {
          provide: SyncTasksService,
          useFactory: () => syncTasksService,
        },
      ],
    }).compile();
    appService = app.get<AppService>(AppService);
  });

  describe('handleHexGridOccupied', () => {
    it('should invoke method "newInvitationSlot" when feature flag "isNewInvitationSlotCreatedOnHexGridOccupiedEnabled" is true', async () => {
      jest
        .spyOn(
          configBizService,
          'isNewInvitationSlotCreatedOnHexGridOccupiedEnabled',
        )
        .mockImplementation(async () => true);
      const newInvitationSlotSpy = jest
        .spyOn(appService, 'newInvitationSlot')
        .mockImplementation(
          async (userId, payload) =>
            new Observable((subscriber) => subscriber.next()),
        );
      expect(newInvitationSlotSpy).toHaveBeenCalledTimes(0);
      await appService.handleHexGridOccupied(new HexGrid());
      expect(newInvitationSlotSpy).toHaveBeenCalledTimes(1);
    });

    it('should not invoke method "newInvitationSlot" when feature flag "isNewInvitationSlotCreatedOnHexGridOccupiedEnabled" is false', async () => {
      jest
        .spyOn(
          configBizService,
          'isNewInvitationSlotCreatedOnHexGridOccupiedEnabled',
        )
        .mockImplementation(async () => false);
      const newInvitationSlotSpy = jest
        .spyOn(appService, 'newInvitationSlot')
        .mockImplementation(
          async (userId, payload) =>
            new Observable((subscriber) => subscriber.next()),
        );
      expect(newInvitationSlotSpy).toHaveBeenCalledTimes(0);
      await appService.handleHexGridOccupied(new HexGrid());
      expect(newInvitationSlotSpy).toHaveBeenCalledTimes(0);
    });
  });
  describe('getHello', () => {
    it('should return the result from UCENTER_MS_CLIENT', async () => {
      jest
        .spyOn(ucenterMsClient, 'send')
        .mockImplementationOnce(
          (pattern, payload) =>
            new Observable((subscriber) => subscriber.next('Hello, World!')),
        );
      const result = await appService.getHello();
      expect(result).toBe('Hello, World!');
    });
  });

  describe('newInvitationSlot', () => {
    it('should build & emit invitation', async () => {
      const mockUserId = 1,
        mockCause = 'unit test',
        mockInvitation = {
          sub: '',
          message: '',
          cause: mockCause,
          inviter_user_id: mockUserId,
          matataki_user_id: 0,
          expired_at: dayjs().add(2, 'month').toDate(),
        };
      const buildSpy = jest
        .spyOn(appService, 'buildInvitation')
        .mockImplementation(async (userId, cause) => mockInvitation);
      const emitSpy = jest
        .spyOn(ucenterMsClient, 'emit')
        .mockImplementationOnce(
          (pattern, payload) =>
            new Observable((subscriber) => subscriber.next()),
        );
      expect(buildSpy).toHaveBeenCalledTimes(0);
      expect(emitSpy).toHaveBeenCalledTimes(0);

      (await appService.newInvitationSlot(mockUserId, mockCause)).subscribe(
        (message) => {
          //
        },
      );
      expect(buildSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(
        UCenterMsClientMethod.NEW_INVITATION_SLOT,
        mockInvitation,
      );
    });
  });

  describe('buildInvitation', () => {
    it('inviter_user_id & casuse should match the params', async () => {
      const mockUserId = 1,
        mockCause = 'unit test';

      jest
        .spyOn(appService, 'getInvitationExiredAt')
        .mockImplementation(async () => dayjs().add(1, 'month').toDate());
      const invitation = await appService.buildInvitation(
        mockUserId,
        mockCause,
      );
      expect(invitation.inviter_user_id).toBe(mockUserId);
      expect(invitation.cause).toBe(mockCause);
    });
    it('expired_at should be n  (n = configBizService.getInvitationExpirationPeriodMonths()) months later ', async () => {
      const mockUserId = 1,
        mockCause = 'unit test';
      jest
        .spyOn(configBizService, 'getInvitationExpirationPeriodMonths')
        .mockImplementation(async (args) => 7);
      const invitation = await appService.buildInvitation(
        mockUserId,
        mockCause,
      );
      const expirationDate = dayjs(invitation.expired_at);
      // console.log(`expirationDate: ${expirationDate}`);
      const diffMonths = expirationDate.diff(dayjs(), 'months');
      expect(diffMonths).toBe(7);
    });
  });

  describe('syncUserProfile', () => {
    it('should update hex-grids by userId', async () => {
      let syncTaskEntity;
      const updatedUsereDtos = [
        {
          id: 1,
          username: 'alice',
          userNickname: 'Alice',
          userAvater: 'https://img.meta.fan/alice.png',
          userBio: 'I am Alice',
        },
        {
          id: 2,
          username: 'bob',
          userNickname: 'Bob',
          userAvater: 'https://img.meta.fan/bob.png',
          userBio: 'I am Bob',
        },
        {
          id: 3,
          username: 'carot',
          userNickname: 'Carot',
          userAvater: 'https://img.meta.fan/carot.png',
          userBio: 'I am Carot',
        },
      ];
      let syncTaskType;
      jest
        .spyOn(syncTasksService, 'findLastSuccessOneByType')
        .mockImplementationOnce(async (type) => {
          syncTaskType = type;
          return null;
        });
      let patternSent: string;
      let lastSyncDateSent: Date;
      jest
        .spyOn(ucenterMsClient, 'send')
        .mockImplementationOnce((pattern: string, data: any) => {
          patternSent = pattern;
          lastSyncDateSent = data.modifiedAfter;
          return new Observable((subscriber) =>
            subscriber.next(
              new MetaInternalResult({
                statusCode: HttpStatus.OK,
                serviceCode: ServiceCode.UCENTER,
                retryable: false,

                message: 'ok',
                data: updatedUsereDtos,
              }),
            ),
          );
        });
      jest
        .spyOn(syncTasksService, 'save')
        .mockImplementation((syncTask) => (syncTaskEntity = syncTask));
      const updateHexGridDtos = [];
      const updateHexGridByUserIdSpy = jest
        .spyOn(hexGridsService, 'updateByUserId')
        .mockImplementation(async (updateHexGridDto) => {
          updateHexGridDtos.push(updateHexGridDto);
        });
      expect(updateHexGridByUserIdSpy).toBeCalledTimes(0);
      const syncTask = await appService.syncUserProfile();
      expect(updateHexGridByUserIdSpy).toBeCalledTimes(
        updateHexGridDtos.length,
      );
      expect(syncTaskType).toBe(SyncTaskType.USER_PROFILE);
      expect(patternSent).toBe(UCenterMsClientMethod.SYNC_USER_PROFILE);
      expect(lastSyncDateSent).toEqual(
        dayjs('2021-01-01 00:00:00 GMT').toDate(),
      );
      expect(syncTask).toEqual(syncTaskEntity);
    });
  });

  describe('onApplicationBootstrap', () => {
    it('UCENTER_MS_CLIENT should connect', async () => {
      const spy = jest.spyOn(ucenterMsClient, 'connect');
      expect(spy).toHaveBeenCalledTimes(0);
      appService.onApplicationBootstrap();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
