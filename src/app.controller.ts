import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CurrentUser } from './auth/jwt-user.decorator';
import { JWTAuthGuard } from './auth/jwt.guard';
import { JWTStrategy } from './auth/jwt.strategy';
import { JWTDecodedUser } from './auth/type';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly jwtStrategy: JWTStrategy,
  ) {}

  @ApiCookieAuth()
  @UseGuards(JWTAuthGuard)
  @Get('me')
  getCurrentUser(@CurrentUser() user: JWTDecodedUser): JWTDecodedUser {
    return user;
  }

  // @Get('jwt-verify-options')
  // getJwtVerifyOptions() {
  //   return this.jwtStrategy.getJwtVerifyOptions();
  // }
}
