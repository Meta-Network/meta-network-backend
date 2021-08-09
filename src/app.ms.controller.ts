import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HexGridsService } from './hex-grids/hex-grids.service';

@Controller()
export class AppMsController {
  constructor(private readonly hexGridsService: HexGridsService) {}

  @MessagePattern('findHexGridByUserId')
  findHexGridByUserId(userId: number) {
    return this.hexGridsService.findOneByUserId(userId);
  }
}
