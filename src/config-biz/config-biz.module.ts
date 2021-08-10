import { CacheModule, Module } from '@nestjs/common';
import { ConfigBizService } from './config-biz.service';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        auth_pass: configService.get('redis.pass'),
        ttl: configService.get('redis.biz_ttl'),
        max: configService.get('redis.biz_max_items'),
      }),
    }),
  ],
  providers: [ConfigBizService],
  exports: [ConfigBizService],
})
export class ConfigBizModule {}
