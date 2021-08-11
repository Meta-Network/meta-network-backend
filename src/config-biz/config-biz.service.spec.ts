import { CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigBizService } from './config-biz.service';

describe('ConfigBizService', () => {
  let service: ConfigBizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [ConfigBizService],
    }).compile();

    service = module.get<ConfigBizService>(ConfigBizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be undefined', async () => {
    expect(await service.getHexGridForbiddenZoneRadius()).toBeUndefined();
  });
});
