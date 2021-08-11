import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { config, WATCHER } from './configuration.biz';
import { Cache } from 'cache-manager';
import * as objectPath from 'object-path';

const HEX_GRID_FORBIDDEN_ZONE_RADIUS = 'hex_grid.forbidden_zone.radius';
const HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED =
  'hex_grid.feature_flags.new_invitation_slot_created_on_hex_grid_occupied';
const AVAILABLE_KEYS = [
  HEX_GRID_FORBIDDEN_ZONE_RADIUS,
  HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED,
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
    const myConfig = config();
    AVAILABLE_KEYS.forEach((key) => {
      this.reloadValue(key, myConfig);
    });
  }

  async loadValue<T = any>(key: string, myConfig = config()): Promise<T> {
    // console.log(myConfig);
    const cachedValue = await this.cache.get<T>(key);
    // console.log('cachedValue: ' + cachedValue);
    if (cachedValue !== undefined && cachedValue !== null) {
      this.logger.debug(`get cached value: ${key} = ${cachedValue}`);
      return cachedValue;
    }
    return this.setCacheValue(key, myConfig);
  }

  async setCacheValue<T = any>(key: string, myConfig = config()) {
    const cachedValue = objectPath.get(myConfig, key);
    // console.log(`objectPath ${key} = ${cachedValue}`);
    this.logger.debug(`set cachedValue: ${key} = ${cachedValue}`);
    await this.cache.set(key, cachedValue);
    return await this.cache.get<T>(key);
  }

  async reloadValue<T = any>(key: string, myConfig = config()): Promise<T> {
    try {
      this.logger.log(`reload cache: ${key}`);

      await this.cache.del(key);
      return await this.loadValue(key, myConfig);
    } catch (err) {
      this.logger.error(`reload cache: ${key} error`, err);
    }
  }

  async getHexGridForbiddenZoneRadius(myConfig = config()): Promise<number> {
    const configValue = await this.loadValue<number>(
      HEX_GRID_FORBIDDEN_ZONE_RADIUS,
      myConfig,
    );
    if (configValue > 0) {
      return configValue;
    }
    return 0;
  }

  async isNewInvitationSlotCreatedOnHexGridOccupiedEnabled(
    myConfig = config(),
  ): Promise<boolean> {
    return this.loadValue<boolean>(
      HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED,
      myConfig,
    );
  }
}
