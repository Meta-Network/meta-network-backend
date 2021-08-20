import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { ApiGeneralResponse } from './decorators/api-general-response.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiGeneralResponse(String)
  @Get()
  index() {
    return 'Welcome to Meta Network!';
  }

  @ApiGeneralResponse(String)
  @Get('hello')
  async hello() {
    return await this.appService.getHello();
  }
}
