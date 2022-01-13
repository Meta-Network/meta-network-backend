import { MetaInternalResult } from '@metaio/microservice-model';
import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { ConfigBizService } from '../../config-biz/config-biz.service';
import { CmsMsClientMethod, MetaMicroserviceClient } from '../../constants';
import { SiteInfoDto } from '../../dto/site-info.dto';

@Injectable()
export class MetaCmsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MetaCmsService.name);

  constructor(
    @Inject(MetaMicroserviceClient.CMS)
    private readonly cmsMsClient: ClientProxy,
    private readonly configBizService: ConfigBizService,
  ) {}

  async fetchUserDefaultSiteInfo(userId: number): Promise<SiteInfoDto> {
    const maxRetry = await this.configBizService.getMicroserviceMaxRetry();
    let retryFlag = false,
      retryCount = 0,
      result;
    this.logger.verbose(
      `Fetching user default meta space site info user id: ${userId}. ${
        retryCount + 1
      } time...`,
    );
    do {
      result = await this.doFetchUserDefaultSiteInfo(userId);
      this.logger.verbose(
        `result: ${JSON.stringify(
          result,
        )} retryCount:${retryCount}, maxRetry: ${maxRetry}`,
      );
      if (result?.statusCode === HttpStatus.OK) {
        return result.data as SiteInfoDto;
      }
      // 重试1次
      if (result?.retryable) {
        retryCount++;
        this.logger.verbose(
          `Fetching user default meta space site info user id: ${userId} failed ${retryCount} time(s).`,
        );
        if (retryCount <= maxRetry) {
          retryFlag = true;
        } else {
          this.logger.verbose(
            `Fetching user default meta space site info user id: ${userId} failed max times.`,
          );
          this.throwFetchUserDefaultSiteInfoException(result);
        }
      } else {
        this.throwFetchUserDefaultSiteInfoException(result);
      }
    } while (retryFlag);
  }

  private throwFetchUserDefaultSiteInfoException(result: MetaInternalResult) {
    this.logger.error(
      `Could not fetch user's meta space info. code: ${result.code} message: ${result.message}`,
    );
    throw new InternalServerErrorException(
      `Could not fetch user's meta space info`,
    );
  }

  private async doFetchUserDefaultSiteInfo(userId: number) {
    return await firstValueFrom(
      this.cmsMsClient.send<MetaInternalResult>(
        CmsMsClientMethod.FETCH_USER_DEFAULT_SITE_INFO,
        {
          userId,
        },
      ),
    );
  }

  async onApplicationBootstrap() {
    await this.cmsMsClient.connect();
  }
}
