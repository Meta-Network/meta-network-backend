import { CacheModule, Module } from '@nestjs/common';
import { ConfigBizService } from './config-biz.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          ttl: configService.get<number>('cache.biz.ttl'),
          max: configService.get<number>('cache.biz.max-items'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ConfigBizService],
  exports: [ConfigBizService],
})
export class ConfigBizModule {}
