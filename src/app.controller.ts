import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CurrentUser } from './auth/jwt-user.decorator';
import { JWTAuthGuard } from './auth/jwt.guard';
import { JWTDecodedUser } from './auth/type';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiCookieAuth()
  @Get('me')
  getCurrentUser(@CurrentUser() user: JWTDecodedUser): JWTDecodedUser {
    return user;
  }

  @Get('verify-options')
  getJwtVerifyOptions() {
    const verifyOptions = {
      algorithms: ['RS256', 'RS384'],
      issuer: this.configService.get<string[]>('jwt.verify.issuer'),
      audience: this.configService.get<string[]>('jwt.verify.audience'),
    };
    return verifyOptions;
  }
}
