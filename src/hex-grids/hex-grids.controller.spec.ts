import { Test, TestingModule } from '@nestjs/testing';
import { HexGridsController } from './hex-grids.controller';
import { HexGridsService } from './hex-grids.service';

describe('HexGridsController', () => {
  let controller: HexGridsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HexGridsController],
      providers: [HexGridsService],
    }).compile();

    controller = module.get<HexGridsController>(HexGridsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
