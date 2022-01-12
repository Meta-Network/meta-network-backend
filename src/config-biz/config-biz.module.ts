import { CacheModule, CacheModuleOptions, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConfigBizService } from './config-biz.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get<CacheModuleOptions>('cache.biz'),
      inject: [ConfigService],
    }),
  ],
  providers: [ConfigBizService],
  exports: [ConfigBizService],
})
export class ConfigBizModule {}
