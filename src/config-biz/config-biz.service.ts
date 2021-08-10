import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { config, WATCHER } from './configuration.biz';
import { Cache } from 'cache-manager';
import * as objectPath from 'object-path';

const KEY_HEX_GRID_FORBIDDEN_ZONE_RADIUS = 'hex_grid.forbidden_zone.radius';
const KEY_HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED =
  'hex_grid.feature_flags.new_invitation_slot_created_on_hex_grid_occupied';

@Injectable()
export class ConfigBizService {
  private logger = new Logger(ConfigBizService.name);
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  onModuleInit() {
    WATCHER.on('change', (path: string) => {
      this.logger.log(`File ${path} changed. Reset cache...`);
      this.cache.reset();
    });
  }
  async loadValue<T = any>(key: string): Promise<T> {
    let cachedValue = await this.cache.get<T>(key);
    if (cachedValue !== null) {
      this.logger.debug(`cached value ${key}:`, cachedValue);
      return cachedValue;
    }
    const myConfig = config();
    cachedValue = objectPath.get(myConfig, key);
    console.log(`cachedValue: ${cachedValue}`);
    await this.cache.set(key, cachedValue);
    return await this.cache.get<T>(key);
  }

  async getHexGridForbiddenZoneRadius(): Promise<number> {
    return this.loadValue<number>(KEY_HEX_GRID_FORBIDDEN_ZONE_RADIUS);
  }

  async isNewInvitationSlotCreatedOnHexGridOccupiedEnabled(): Promise<boolean> {
    return this.loadValue<boolean>(
      KEY_HEX_GRID_FEATURE_FLAGS_NEW_INTIVATION_SLOT_CREATED_ON_HEX_GRID_OCCUPIED,
    );
  }
}
