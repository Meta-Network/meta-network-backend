import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppMsController } from '../src/app.ms.controller';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HexGridsService } from '../src/hex-grids/hex-grids.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexGrid } from '../src/entities/hex-grid.entity';

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

  it('hello', async () => {
    const result = await firstValueFrom(
      appMsClient.send<string>('hello2', { name: 'John Smith' }),
    );
    expect(result).toBe('Hello, John Smith');
  });
});
