import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  NatsContext,
  Payload,
} from '@nestjs/microservices';
import { AppMsEvent, AppMsMethod } from './constants';
import { SiteInfoDto } from './dto/site-info.dto';
import { UserDto } from './dto/user.dto';
import { HexGridsService } from './hex-grids/hex-grids.service';

@Controller()
export class AppMsController {
  private logger = new Logger(AppMsController.name);
  constructor(private readonly hexGridsService: HexGridsService) {}

  @MessagePattern(AppMsMethod.FIND_HEX_GRID_BY_USER_ID)
  findHexGridByUserId(userId: number) {
    return this.hexGridsService.findOneByUserId(userId);
  }

  @MessagePattern('hello2')
  handleHello(@Payload() payload: any, @Ctx() context: NatsContext) {
    console.log(`Hello, ${payload.name}`);
    this.logger.log('handleHello', payload);
    return `Hello, ${payload.name}`;
  }

  @MessagePattern(AppMsEvent.USER_PROFILE_MODIFIED)
  handleUserProfileModified(
    @Payload() payload: any,
    @Ctx() context: NatsContext,
  ) {
    this.logger.log('handleUserProfileModified', payload);
    this.hexGridsService.updateByUserId({
      userId: payload.id,
      username: payload.username,
      userNickname: payload.nickname,
    });
  }

  @MessagePattern(AppMsEvent.META_SPACE_SITE_CREATED)
  handleMetaSpaceSiteCreated(payload: SiteInfoDto) {
    this.logger.log('handleMetaSpaceSiteCreated', payload);
    // TODO
  }
}
