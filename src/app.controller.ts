import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

import { JWTStrategy } from './auth/jwt.strategy';

import { ApiGeneralResponse } from './decorators/api-general-response.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly jwtStrategy: JWTStrategy,
  ) {}

  @ApiGeneralResponse(String)
  @Get()
  index() {
    return 'Welcome to Meta Network!';
  }
}
