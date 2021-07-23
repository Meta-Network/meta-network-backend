import { Controller, Get } from '@nestjs/common';
import { HexGridsService } from './hex-grids.service';

@Controller('hex-grids')
export class HexGridsController {
  constructor(private readonly hexGridsService: HexGridsService) {}

  @Get()
  getHello(): string {
    return 'hello, Hex Grids';
  }
}
