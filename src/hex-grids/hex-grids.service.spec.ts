import { Test, TestingModule } from '@nestjs/testing';
import { HexGridsService } from './hex-grids.service';

describe('HexGridsService', () => {
  let service: HexGridsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HexGridsService],
    }).compile();

    service = module.get<HexGridsService>(HexGridsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
