import { MetaInternalResult } from '@metaio/microservice-model';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';

import { ConfigBizService } from './config-biz/config-biz.service';
import { CmsMsClientMethod, UCenterMsClientMethod } from './constants';
import { SiteInfoDto } from './dto/site-info.dto';
import { UserDto } from './dto/user.dto';
import { HexGrid } from './entities/hex-grid.entity';
import { HexGridsEvent } from './hex-grids/hex-grids.constant';
import { HexGridsService } from './hex-grids/hex-grids.service';
import {
  SyncTaskCallbackResult,
  SyncTasksService,
} from './sync-tasks/sync-tasks.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @Inject('UCENTER_MS_CLIENT') private readonly ucenterMsClient: ClientProxy,
    @Inject('CMS_MS_CLIENT') private readonly cmsMsClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly configBizService: ConfigBizService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly syncTaskService: SyncTasksService,
    private readonly hexGridsService: HexGridsService,
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
      UCenterMsClientMethod.HELLO,
      {
        hello: 'world',
      },
    );
    return firstValueFrom(result);
  }

  async newInvitationSlot(userId: number, cause: string) {
    return this.ucenterMsClient.emit<void>(
      UCenterMsClientMethod.NEW_INVITATION_SLOT,
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

  async syncUserProfile() {
    this.logger.log('syncUserProfile');

    return await this.syncTaskService.syncUserProfile(async (modifiedAfter) => {
      const result = await firstValueFrom(
        this.ucenterMsClient.send<MetaInternalResult>(
          UCenterMsClientMethod.SYNC_USER_PROFILE,
          {
            modifiedAfter,
          },
        ),
      );
      this.logger.debug('fetchUsers', JSON.stringify(result));
      const modifiedUserDtos = result.data as UserDto[];
      const count = modifiedUserDtos?.length || 0;
      for (const userDto of modifiedUserDtos) {
        this.hexGridsService.updateByUserId({
          userId: userDto.id,
          username: userDto.username,
          userNickname: userDto.nickname,
          userBio: userDto.bio,
          userAvatar: userDto.avatar,
          inviterUserId: userDto.inviter_user_id,
        });
      }
      return SyncTaskCallbackResult.success(count);
    });
  }

  async syncSiteInfo() {
    this.logger.log('syncSiteInfo');

    return await this.syncTaskService.syncSiteInfo(async (modifiedAfter) => {
      const result = await firstValueFrom(
        this.cmsMsClient.send<MetaInternalResult>(
          CmsMsClientMethod.SYNC_SITE_INFO,
          {
            modifiedAfter,
          },
        ),
      );
      this.logger.debug('fetchSiteInfos', JSON.stringify(result));
      const modifiedSiteInfoDtos = result.data as SiteInfoDto[];
      const count = modifiedSiteInfoDtos?.length || 0;
      const metaSpaceDomain = this.configService.get<string>(
        'meta.meta-space-domain',
      );
      for (const siteInfoDto of modifiedSiteInfoDtos) {
        this.hexGridsService.updateByUserId({
          userId: siteInfoDto.userId,
          subdomain: `${siteInfoDto.metaSpacePrefix}.${metaSpaceDomain}`,
          metaSpaceSiteId: siteInfoDto.configId,
          metaSpaceSiteUrl: `https://${siteInfoDto.domain}`,
        });
      }
      return SyncTaskCallbackResult.success(count);
    });
  }

  async onApplicationBootstrap() {
    await this.ucenterMsClient.connect();
    await this.cmsMsClient.connect();
    if (this.configService.get<boolean>('cron.enabled')) {
      this.addStartSyncUserProfileJob();
      this.addStartSyncSiteInfoJob();
    }
    console.log(this.schedulerRegistry.getCronJobs());
  }

  private addStartSyncUserProfileJob(): CronJob {
    const syncUserProfileJob = new CronJob(
      this.configService.get('cron.sync_user_profile'),
      () => {
        this.syncUserProfile();
      },
    );
    this.schedulerRegistry.addCronJob(
      UCenterMsClientMethod.SYNC_USER_PROFILE,
      syncUserProfileJob,
    );
    syncUserProfileJob.start();
    return syncUserProfileJob;
  }
  private addStartSyncSiteInfoJob(): CronJob {
    const syncSiteInfoJob = new CronJob(
      this.configService.get('cron.sync_site_info'),
      () => {
        this.syncSiteInfo();
      },
    );
    this.schedulerRegistry.addCronJob(
      CmsMsClientMethod.SYNC_SITE_INFO,
      syncSiteInfoJob,
    );
    syncSiteInfoJob.start();
    return syncSiteInfoJob;
  }
}
