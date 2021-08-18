import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppMsController } from '../src/app.ms.controller';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HexGridsService } from '../src/hex-grids/hex-grids.service';
import { AppMsMethod } from '../src/constants';
import { MetaInternalResult } from '@metaio/microservice-model';

describe('AppMsController (e2e)', () => {
  let app: INestApplication;
  let appMsClient: ClientProxy;
  let hexGridsService: HexGridsService;
  beforeEach(async () => {
    hexGridsService = new HexGridsService(null, null, null);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // TypeOrmModule.forFeature([HexGrid], {
        //   type: 'sqlite',
        //   database: ':memory:',
        //   dropSchema: true,
        //   entities: [HexGrid],
        //   synchronize: true,
        //   logging: false,
        // }),
        ClientsModule.register([
          {
            name: 'APP_MS_CLIENT',
            transport: Transport.NATS,
            options: {
              servers: ['nats://localhost:4222'],
              queue: 'meta_network_test_queue',
            },
          },
        ]),
      ],
      controllers: [AppMsController],
      providers: [
        {
          provide: HexGridsService,
          useFactory: () => hexGridsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.connectMicroservice({
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
        queue: 'meta_network_test_queue',
      },
    });
    await app.startAllMicroservices();

    await app.init();
    appMsClient = app.get<ClientProxy>('APP_MS_CLIENT');
    await appMsClient.connect();
  });

  afterEach(async () => {
    if (appMsClient) {
      await appMsClient.close();
    }
    if (app) {
      await app.close();
    }
  });

  it('findHexGridByUserId', async () => {
    const mockHexGrid = {
      id: 1,
      x: 1,
      y: 11,
      z: -12,
      userId: 2,
      username: 'bob',
      userNickname: 'Bob',
      userAvatar: 'https://image.meta.fan/bob.png',
      userBio: 'Some Description',
      siteName: '',
      subdomain: '',
      metaSpaceSiteId: 0,
      metaSpaceSiteUrl: '',
      metaSpaceSiteProofUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest
      .spyOn(hexGridsService, 'findOneByUserId')
      .mockImplementation(async (userId) => mockHexGrid);
    const result = await firstValueFrom(
      appMsClient.send<MetaInternalResult>(
        AppMsMethod.FIND_HEX_GRID_BY_USER_ID,
        2,
      ),
    );
    expect(result.statusCode).toBe(HttpStatus.OK);
    result.data.createdAt = new Date(result.data.createdAt);
    result.data.updatedAt = new Date(result.data.updatedAt);

    expect(result.data).toEqual(mockHexGrid);
  });
});
