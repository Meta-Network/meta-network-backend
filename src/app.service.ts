import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { HexGridsEvent } from './hex-grids/hex-grids.constant';
import { HexGrid } from './entities/hex-grid.entity';
import { ConfigBizService } from './config-biz/config-biz.service';
import { firstValueFrom } from 'rxjs';
import { UcenterMsClientMethod } from './constants';

@Injectable()
export class AppService {
  constructor(
    @Inject('UCENTER_MS_CLIENT') private readonly ucenterMsClient: ClientProxy,
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

  async getHello(): Promise<string> {
    const result = this.ucenterMsClient.send<string>(
      UcenterMsClientMethod.HELLO,
      {
        hello: 'world',
      },
    );
    return firstValueFrom(result);
  }

  async newInvitationSlot(userId: number, cause: string) {
    return this.ucenterMsClient.emit<void>(
      UcenterMsClientMethod.NEW_INVITATION_SLOT,
      await this.buildInvitation(userId, cause),
    );
  }

  async buildInvitation(userId: number, cause: string) {
    return {
      sub: '',
      message: '',
      cause,
      inviter_user_id: userId,
      matataki_user_id: 0,
      expired_at: await this.getInvitationExiredAt(),
    };
  }

  async getInvitationExiredAt() {
    return dayjs()
      .add(
        await this.configBizService.getInvitationExpirationPeriodMonths(),
        'month',
      )
      .add(1, 'day')
      .hour(0)
      .minute(0)
      .second(0)
      .toDate();
  }

  async onApplicationBootstrap() {
    await this.ucenterMsClient.connect();
  }
}
