import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_KEY } from '../constants';
import { JWTTokenPayload } from './type/jwt-payload';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => req.cookies['ucenter_accessToken'],
      ignoreExpiration: false,
      secretOrKey: JWT_KEY.publicKey,
      algorithms: ['RS256', 'RS384'],
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
