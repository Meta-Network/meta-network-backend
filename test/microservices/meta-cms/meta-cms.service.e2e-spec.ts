import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigBizModule } from '../../../src/config-biz/config-biz.module';
import {
  CmsMsClientMethod,
  MetaMicroserviceClient,
} from '../../../src/constants';
import { MetaCmsService } from '../../../src/microservices/meta-cms/meta-cms.service';

describe('MetaCmsService (e2e)', () => {
  let metaCmsService: MetaCmsService;
  let cmsMsClient: ClientProxy;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ScheduleModule.forRoot(),
        ConfigBizModule,
        ClientsModule.register([
          {
            name: 'CMS_MS_CLIENT',
            transport: Transport.NATS,
            options: {
              servers: ['nats://localhost:4222'],
              queue: 'meta_network_test_queue',
            },
          },
        ]),
      ],
      providers: [MetaCmsService],
    }).compile();
    metaCmsService = app.get<MetaCmsService>(MetaCmsService);
    cmsMsClient = app.get<ClientProxy>(MetaMicroserviceClient.CMS);
  });
  describe('fetchUserDefaultSiteInfo', () => {
    it('should return site info', async () => {
      jest.setTimeout(15000);
      const mockUserId = -12345677890;

      const sendSpy = jest.spyOn(cmsMsClient, 'send');
      //   .mockImplementationOnce(
      //     (pattern, payload) =>
      //       new Observable((subscriber) => subscriber.next()),
      //   );
      expect(sendSpy).toHaveBeenCalledTimes(0);

      const siteInfo = await metaCmsService.fetchUserDefaultSiteInfo(
        mockUserId,
      );
      console.log('site info', siteInfo);
      expect(sendSpy).toHaveBeenCalledWith(
        CmsMsClientMethod.FETCH_USER_DEFAULT_SITE_INFO,
        { userId: mockUserId },
      );
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('onApplicationBootstrap', () => {
    it('CMS_MS_CLIENT should connect', async () => {
      const spy = jest.spyOn(cmsMsClient, 'connect');
      expect(spy).toHaveBeenCalledTimes(0);
      metaCmsService.onApplicationBootstrap();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
