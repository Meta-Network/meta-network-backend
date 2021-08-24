import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { JWT_KEY } from '../config/configuration';
import { JWTTokenPayload } from './type/jwt-payload';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) =>
        req.cookies[configService.get<string>('jwt.access_token_key')],
      ignoreExpiration: false,
      secretOrKey: JWT_KEY.publicKey,
      algorithms: ['RS256', 'RS384'],
      issuer: configService.get<string[]>('jwt.verify.issuer'),
      audience: configService.get<string[]>('jwt.verify.audience'),
    });
  }

  getJwtVerifyOptions() {
    return {
      algorithms: ['RS256', 'RS384'],
      issuer: this.configService.get<string[]>('jwt.verify.issuer'),
      audience: this.configService.get<string[]>('jwt.verify.audience'),
    };
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
