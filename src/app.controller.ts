import { Get, Controller } from '@nestjs/common';

import { ApiGeneralResponse } from './decorators/api-general-response.decorator';
import { AppService } from './app.service';

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
