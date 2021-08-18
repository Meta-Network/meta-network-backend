import { Controller, HttpStatus, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  NatsContext,
  Payload,
} from '@nestjs/microservices';
import { AppMsEvent, AppMsMethod } from './constants';
import { SiteInfoDto } from './dto/site-info.dto';
import { HexGridsService } from './hex-grids/hex-grids.service';
import { MetaInternalResult, ServiceCode } from '@metaio/microservice-model';

@Controller()
export class AppMsController {
  private logger = new Logger(AppMsController.name);
  constructor(private readonly hexGridsService: HexGridsService) {}

  @MessagePattern(AppMsMethod.FIND_HEX_GRID_BY_USER_ID)
  async findHexGridByUserId(userId: number) {
    try {
      const hexGrid = await this.hexGridsService.findOneByUserId(userId);
      return new MetaInternalResult({
        statusCode: HttpStatus.OK,
        serviceCode: ServiceCode.NETWORK,
        data: hexGrid,
      });
    } catch (err) {
      this.logger.error(err);
      return new MetaInternalResult({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        serviceCode: ServiceCode.NETWORK,
        retryable: true,
      });
    }
  }

  @EventPattern(AppMsEvent.USER_PROFILE_MODIFIED)
  handleUserProfileModified(
    @Payload() payload: any,
    @Ctx() context: NatsContext,
  ) {
    this.logger.log('handleUserProfileModified', payload, context.getSubject());
    this.hexGridsService.updateByUserId({
      userId: payload.id,
      username: payload.username,
      userNickname: payload.nickname,
      userBio: payload.bio,
      userAvatar: payload.avatar,
    });
  }

  @EventPattern(AppMsEvent.META_SPACE_SITE_CREATED)
  handleMetaSpaceSiteCreated(payload: SiteInfoDto) {
    this.logger.log('handleMetaSpaceSiteCreated', payload);
    // TODO
  }
}
