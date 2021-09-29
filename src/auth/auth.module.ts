import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JWTAuthGuard } from './jwt.guard';
import { JWTStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule],
  providers: [AuthService, JWTAuthGuard, JWTStrategy],
  exports: [AuthService, JWTAuthGuard, JWTStrategy],
})
export class AuthModule {}
