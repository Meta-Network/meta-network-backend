import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createConnection, getConnection, getRepository } from 'typeorm';
import { ConfigBizModule } from '../config-biz/config-biz.module';
import { HexGrid } from '../entities/hex-grid.entity';
import { HexGridsService } from './hex-grids.service';

describe('HexGridsService', () => {
  let service: HexGridsService;

  const testConnectionName = 'testConn';

  beforeEach(async () => {
    const connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [HexGrid],
      synchronize: true,
      logging: false,
      name: testConnectionName,
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        ConfigBizModule,
        EventEmitterModule.forRoot(),
      ],
      providers: [
        HexGridsService,
        {
          provide: getRepositoryToken(HexGrid),
          useFactory: () => getRepository(HexGrid, testConnectionName),
        },
      ],
    }).compile();

    service = module.get<HexGridsService>(HexGridsService);
    return connection;
  });

  afterEach(async () => {
    await getConnection(testConnectionName).close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
