import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { HexGridsEvent } from './hex-grids/hex-grids.constant';
import { HexGrid } from './entities/hex-grid.entity';
import { ConfigBizService } from './config-biz/config-biz.service';

@Injectable()
export class AppService {
  constructor(
    @Inject('UCENTER_MS_CLIENT') private readonly ucenterClient: ClientProxy,
    private readonly configBizService: ConfigBizService,
  ) {}

  @OnEvent(HexGridsEvent.OCCUPIED)
  async handleHexGridOccupied(payload: HexGrid) {
    if (
      await this.configBizService.isNewInvitationSlotCreatedOnHexGridOccupiedEnabled()
    ) {
      this.newInvitationSlot(payload.userId, HexGridsEvent.OCCUPIED);
    }
  }

  getHello() {
    return this.ucenterClient.send<string>('hello', { hello: 'world' });
  }

  async newInvitationSlot(userId: number, cause: string) {
    return this.ucenterClient.emit<string>('new_invitation_slot', {
      sub: '',
      message: '',
      cause,
      inviter_user_id: userId,
      matataki_user_id: 0,
      expired_at: dayjs().add(2, 'month').toDate(),
    });
  }

  async onApplicationBootstrap() {
    await this.ucenterClient.connect();
  }
}
