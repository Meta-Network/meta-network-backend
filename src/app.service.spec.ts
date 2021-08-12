import {
  ClientProxy,
  ClientProxyFactory,
  ReadPacket,
} from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { ConfigBizService } from './config-biz/config-biz.service';
import { HexGrid } from './entities/hex-grid.entity';

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
  let clientProxy: ClientProxy;
  const configBizService = new ConfigBizService(null);
  beforeEach(async () => {
    clientProxy = new MockClientProxy();
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: 'UCENTER_MS_CLIENT',
          useFactory: () => clientProxy,
        },
        {
          provide: ConfigBizService,
          useFactory: () => configBizService,
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
    it('should return the result from UCENTER_MS_CLIENT', () => {
      let result;
      jest
        .spyOn(clientProxy, 'send')
        .mockImplementationOnce(
          (pattern, payload) =>
            new Observable((subscriber) => subscriber.next('Hello, World!')),
        );
      appService.getHello().subscribe((message) => {
        result = message;
      });
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
        .spyOn(clientProxy, 'emit')
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
        'new_invitation_slot',
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

  describe('onApplicationBootstrap', () => {
    it('UCENTER_MS_CLIENT should connect', async () => {
      const spy = jest.spyOn(clientProxy, 'connect');
      expect(spy).toHaveBeenCalledTimes(0);
      appService.onApplicationBootstrap();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
