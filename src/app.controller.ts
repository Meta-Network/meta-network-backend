import { Get, Controller, Inject, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { CurrentUser } from './auth/jwt-user.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { JWTAuthGuard } from './auth/jwt.guard';
import { JWTDecodedUser } from './auth/type';
import dayjs from 'dayjs';

@ApiCookieAuth()
@Controller()
export class AppController {
  constructor(
    @Inject('UCENTER_MS_CLIENT') private ucenterClient: ClientProxy,
  ) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: JWTDecodedUser): JWTDecodedUser {
    return user;
  }

  @Get('test-invitation')
  @UseGuards(JWTAuthGuard)
  emitInvitationEvent(@CurrentUser() user: JWTDecodedUser): Observable<string> {
    return this.ucenterClient.emit<string>('new_invitation_slot', {
      sub: '',
      message: '',
      inviter_user_id: user.id,
      matataki_user_id: 0,
      expired_at: dayjs().add(2, 'month').toDate(),
    });
  }

  async onApplicationBootstrap() {
    await this.ucenterClient.connect();
  }
}
