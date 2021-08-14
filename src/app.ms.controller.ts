import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
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

  @EventPattern(AppMsEvent.USER_PROFILE_MODIFIED)
  handleUserProfileModified(payload: UserDto) {
    this.logger.log('handleUserProfileModified', payload);
    this.hexGridsService.updateByUserId({
      userId: payload.id,
      username: payload.username,
      userNickname: payload.nickname,
    });
  }

  @EventPattern(AppMsEvent.META_SPACE_SITE_CREATED)
  handleMetaSpaceSiteCreated(payload: SiteInfoDto) {
    this.logger.log('handleMetaSpaceSiteCreated', payload);
    // TODO
  }
}
