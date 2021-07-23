import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_KEY } from '../constants';
import { JWTTokenPayload } from './type/jwt-payload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) => req.cookies['ucenter_accessToken'],
      ignoreExpiration: false,
      secretOrKey: JWT_KEY.publicKey,
      algorithms: ['RS256', 'RS384'],
      issuer: configService.get<string[]>('jwt.verify.issuer'),
      audience: configService.get<string[]>('jwt.verify.audience'),
    });
  }

  async validate(payload: JWTTokenPayload) {
    const result = {
      id: payload.sub,
      ...payload,
    };
    delete result.sub;
    return result;
  }
}
