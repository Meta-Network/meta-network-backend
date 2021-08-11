import { CacheModule, CacheModuleOptions, Module } from '@nestjs/common';
import { ConfigBizService } from './config-biz.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
