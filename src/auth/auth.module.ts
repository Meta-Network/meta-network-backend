import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_KEY } from 'src/constants';
import { AuthService } from './auth.service';
import { JWTAuthGuard } from './jwt.guard';
import { JWTStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        publicKey: JWT_KEY.publicKey,
        verifyOptions: {
          algorithms: ['RS256', 'RS384'],
          issuer: configService.get<string[]>('jwt.verify.issuer'),
          audience: configService.get<string[]>('jwt.verify.audience'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JWTStrategy, JWTAuthGuard],
  exports: [AuthService, JWTStrategy, JWTAuthGuard, JwtModule],
})
export class AuthModule {}
