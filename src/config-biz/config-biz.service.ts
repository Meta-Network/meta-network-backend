import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as objectPath from 'object-path';

import { loadConfig, WATCHER } from './configuration.biz';

const HEX_GRID_FORBIDDEN_ZONE_RADIUS = 'hex_grid.forbidden_zone.radius';
const HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED =
  'hex_grid.feature_flags.new_invitation_slot_created_on_hex_grid_occupied';
const HEX_GRID_FEATURE_FLAGS_UPLOAD_TO_ARWEAVE =
  'hex_grid.feature_flags.upload_to_arweave';
const INVITATION_EXPIRATION_PERIOD_MONTHS =
  'invitation.expiration_period_months';
const MICROSERVICE_MAX_RETRY = 'microservice.max_retry';
const AVAILABLE_KEYS = [
  HEX_GRID_FORBIDDEN_ZONE_RADIUS,
  HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED,
  HEX_GRID_FEATURE_FLAGS_UPLOAD_TO_ARWEAVE,
  INVITATION_EXPIRATION_PERIOD_MONTHS,
  MICROSERVICE_MAX_RETRY,
];
@Injectable()
export class ConfigBizService {
  private logger = new Logger(ConfigBizService.name);
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  onApplicationBootstrap() {
    this.logger.debug('onApplicationBootstrap');
    this.refreshCache();
    WATCHER.on('change', (path: string) => {
      this.logger.log(`File ${path} changed. Refresh cache...`);
      this.refreshCache();
    });
  }

  refreshCache(): void {
    // 统一刷新就不需要每个值都读取 YAML
    const myConfig = loadConfig();
    AVAILABLE_KEYS.forEach((key) => {
      this.reloadValue(key, myConfig);
    });
  }

  async loadValue<T = any>(key: string, myConfig = loadConfig()): Promise<T> {
    // console.log(myConfig);
    const cachedValue = await this.cache.get<T>(key);
    // console.log('cachedValue: ' + cachedValue);
    if (cachedValue !== undefined && cachedValue !== null) {
      this.logger.debug(`get cached value: ${key} = ${cachedValue}`);
      return cachedValue;
    }
    return this.setCacheValue(key, myConfig);
  }

  async setCacheValue<T = any>(key: string, myConfig = loadConfig()) {
    const cachedValue = objectPath.get(myConfig, key);
    // console.log(`objectPath ${key} = ${cachedValue}`);
    this.logger.debug(`set cachedValue: ${key} = ${cachedValue}`);
    await this.cache.set(key, cachedValue);
    return await this.cache.get<T>(key);
  }

  async reloadValue<T = any>(key: string, myConfig = loadConfig()): Promise<T> {
    try {
      this.logger.log(`reload cache: ${key}`);

      await this.cache.del(key);
      return await this.loadValue(key, myConfig);
    } catch (err) {
      this.logger.error(`reload cache: ${key} error`, err);
    }
  }

  async getHexGridForbiddenZoneRadius(
    myConfig = loadConfig(),
  ): Promise<number> {
    const configValue = await this.loadValue<number>(
      HEX_GRID_FORBIDDEN_ZONE_RADIUS,
      myConfig,
    );

    if (Number.isInteger(configValue) && configValue >= 0) {
      return configValue;
    }
    return 10;
  }

  async isNewInvitationSlotCreatedOnHexGridOccupiedEnabled(
    myConfig = loadConfig(),
  ): Promise<boolean> {
    return this.loadValue<boolean>(
      HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED,
      myConfig,
    );
  }

  async isUploadToArweaveEnabled(myConfig = loadConfig()): Promise<boolean> {
    return this.loadValue<boolean>(
      HEX_GRID_FEATURE_FLAGS_UPLOAD_TO_ARWEAVE,
      myConfig,
    );
  }

  async getInvitationExpirationPeriodMonths(
    myConfig = loadConfig(),
  ): Promise<number> {
    const configValue = await this.loadValue<number>(
      INVITATION_EXPIRATION_PERIOD_MONTHS,
      myConfig,
    );
    if (Number.isInteger(configValue) && configValue > 0) {
      return configValue;
    }
    return 1;
  }
  async getMicroserviceMaxRetry(myConfig = loadConfig()): Promise<number> {
    const configValue = await this.loadValue<number>(
      MICROSERVICE_MAX_RETRY,
      myConfig,
    );
    if (Number.isInteger(configValue) && configValue > 0) {
      return configValue;
    }
    return 1;
  }
}
