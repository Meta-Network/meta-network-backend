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

  onModuleInit() {
    this.logger.debug('onModuleInit');
    this.refreshCache();
    WATCHER.on('change', (path: string) => {
      this.logger.log(`File ${path} changed. Refresh cache...`);
      this.refreshCache();
    });
  }

  private refreshCache() {
    // 统一刷新就不需要每个值都读取 YAML
    const myConfig = config();
    AVAILABLE_KEYS.forEach((key) => {
      this.reloadValue(key, myConfig);
    });
  }

  private async loadValue<T = any>(
    key: string,
    myConfig = config(),
  ): Promise<T> {
    console.log(myConfig);
    let cachedValue = await this.cache.get<T>(key);
    if (cachedValue !== null) {
      this.logger.debug(`get cached value: ${key} = ${cachedValue}`);
      return cachedValue;
    }

    cachedValue = objectPath.get(myConfig, key);
    this.logger.debug(`set cachedValue: ${key} = ${cachedValue}`);
    await this.cache.set(key, cachedValue);
    return await this.cache.get<T>(key);
  }

  private async reloadValue<T = any>(
    key: string,
    myConfig = config(),
  ): Promise<T> {
    try {
      this.logger.log(`reload cache: ${key}`);

      await this.cache.del(key);
      return await this.loadValue(key, myConfig);
    } catch (err) {
      this.logger.error(`reload cache: ${key} error`, err);
    }
  }

  async getHexGridForbiddenZoneRadius(): Promise<number> {
    return this.loadValue<number>(HEX_GRID_FORBIDDEN_ZONE_RADIUS);
  }

  async isNewInvitationSlotCreatedOnHexGridOccupiedEnabled(): Promise<boolean> {
    return this.loadValue<boolean>(
      HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED,
    );
  }
}
