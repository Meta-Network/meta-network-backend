import { Get, Controller, Inject, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { CurrentUser } from './auth/jwt-user.decorator';

import { JWTAuthGuard } from './auth/jwt.guard';
import { JWTDecodedUser } from './auth/type';
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

  @Get('hello')
  hello() {
    return this.appService.getHello();
  }
}
