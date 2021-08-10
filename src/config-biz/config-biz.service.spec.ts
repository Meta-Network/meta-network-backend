import { Test, TestingModule } from '@nestjs/testing';
import { ConfigBizService } from './config-biz.service';

describe('ConfigBizService', () => {
  let service: ConfigBizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigBizService],
    }).compile();

    service = module.get<ConfigBizService>(ConfigBizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
