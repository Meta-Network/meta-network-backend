import { CacheModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigBizService } from './config-biz.service';
import { loadConfig, WATCHER } from './configuration.biz';

describe('ConfigBizService', () => {
  let service: ConfigBizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [ConfigBizService],
    }).compile();

    service = module.get<ConfigBizService>(ConfigBizService);
    // onModuleInitSpy = jest.spyOn(service, 'onModuleInit');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    // it('should have been called', async () => {
    //   expect(onModuleInitSpy).toHaveBeenCalled();
    // });

    it('should refresh cache', async () => {
      const refreshCacheSpy = jest.spyOn(service, 'refreshCache');
      expect(refreshCacheSpy).toHaveBeenCalledTimes(0);
      service.onApplicationBootstrap();
      expect(refreshCacheSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle watcher change event', async () => {
      const refreshCacheSpy = jest.spyOn(service, 'refreshCache');
      expect(refreshCacheSpy).toHaveBeenCalledTimes(0);
      service.onApplicationBootstrap();
      expect(refreshCacheSpy).toHaveBeenCalledTimes(1);
      WATCHER.emit('change');
      expect(refreshCacheSpy).toHaveBeenCalledTimes(2);
    });
  });
  describe('getHexGridForbiddenZoneRadius', () => {
    it('should match the (valid) value specified in the configuration file (config.biz.development.yaml)', async () => {
      let configValue = loadConfig().hex_grid.forbidden_zone.radius;
      if (!(configValue > 0)) {
        configValue = 0;
      }
      expect(await service.getHexGridForbiddenZoneRadius()).toBe(configValue);
    });
    it('same calls should be the same result', async () => {
      const value1 = await service.getHexGridForbiddenZoneRadius();
      const value2 = await service.getHexGridForbiddenZoneRadius();
      expect(value2).toBe(value1);
    });
    it('should be 20 when the value specified in the config object is 20', async () => {
      expect(
        await service.getHexGridForbiddenZoneRadius({
          hex_grid: { forbidden_zone: { radius: 20 } },
        }),
      ).toBe(20);
    });
    it('should be 0 when the value specified in the config object is  0', async () => {
      expect(
        await service.getHexGridForbiddenZoneRadius({
          hex_grid: { forbidden_zone: { radius: 0 } },
        }),
      ).toBe(0);
    });
    it('should be 10 when the value specified in the config object is less than 0', async () => {
      expect(
        await service.getHexGridForbiddenZoneRadius({
          hex_grid: { forbidden_zone: { radius: -1 } },
        }),
      ).toBe(10);
    });
    it('should be 10 when the value specified in the config object is not an integer', async () => {
      expect(
        await service.getHexGridForbiddenZoneRadius({
          hex_grid: { forbidden_zone: { radius: 'hehe' } },
        }),
      ).toBe(10);
    });
    it('should load value', async () => {
      const spy = jest.spyOn(service, 'loadValue');
      expect(spy).toHaveBeenCalledTimes(0);
      await service.getHexGridForbiddenZoneRadius();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  describe('isNewInvitationSlotCreatedOnHexGridOccupiedEnabled', () => {
    it('should match the value specified in the configuration file (config.biz.development.yaml)', async () => {
      expect(
        await service.isNewInvitationSlotCreatedOnHexGridOccupiedEnabled(),
      ).toBe(
        loadConfig().hex_grid.feature_flags
          .new_invitation_slot_created_on_hex_grid_occupied,
      );
    });
    it('should return false when config is set to false', async () => {
      expect(
        await service.isNewInvitationSlotCreatedOnHexGridOccupiedEnabled({
          hex_grid: {
            feature_flags: {
              new_invitation_slot_created_on_hex_grid_occupied: false,
            },
          },
        }),
      ).toBe(false);
    });
    it('should load value', async () => {
      const spy = jest.spyOn(service, 'loadValue');
      expect(spy).toHaveBeenCalledTimes(0);
      await service.isNewInvitationSlotCreatedOnHexGridOccupiedEnabled();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  describe('getInvitationExpiration', () => {
    it('should match the value specified in the configuration file (config.biz.development.yaml)', async () => {
      expect(await service.getInvitationExpirationPeriodMonths()).toBe(
        loadConfig().invitation.expiration_period_months,
      );
    });
    it('should match the value specified in the config which is greater than 0', async () => {
      expect(
        await service.getInvitationExpirationPeriodMonths({
          invitation: {
            expiration_period_months: 6,
          },
        }),
      ).toBe(6);
    });

    it('should be 1 when the value specified in the config less than 1', async () => {
      expect(
        await service.getInvitationExpirationPeriodMonths({
          invitation: {
            expiration_period_months: 0,
          },
        }),
      ).toBe(1);
    });
    it('should be 1 when the value specified in the config is not an integer', async () => {
      expect(
        await service.getInvitationExpirationPeriodMonths({
          invitation: {
            expiration_period_months: 'hahaha',
          },
        }),
      ).toBe(1);
    });
    it('should load value', async () => {
      const spy = jest.spyOn(service, 'loadValue');
      expect(spy).toHaveBeenCalledTimes(0);
      await service.isNewInvitationSlotCreatedOnHexGridOccupiedEnabled();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('reloadCache', () => {
    it('should be undefined when key is not existed', async () => {
      const value = await service.reloadValue(
        'HEX_GRID_FORBIDDEN_ZONE_RADIUS', // wrong key
        {},
      );
      expect(value).toBeUndefined();
    });
  });
});
