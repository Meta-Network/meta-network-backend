import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CurrentUser } from './auth/jwt-user.decorator';
import { JWTStrategy } from './auth/jwt.strategy';
import { JWTDecodedUser } from './auth/type';

@ApiCookieAuth()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly jwtStrategy: JWTStrategy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user: JWTDecodedUser): JWTDecodedUser {
    return user;
  }

  @Get('jwt-verify-options')
  getJwtVerifyOptions() {
    return this.jwtStrategy.getJwtVerifyOptions();
  }
}
