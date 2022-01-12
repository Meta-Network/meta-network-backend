import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';

import { ConfigBizModule } from '../../config-biz/config-biz.module';
import { MetaMicroserviceClient } from '../../constants';
import { MetaCmsService } from './meta-cms.service';

@Module({
  imports: [
    ConfigBizModule,

    ClientsModule.registerAsync([
      {
        name: MetaMicroserviceClient.CMS,
        imports: [ConfigModule],

        useFactory: async (configService: ConfigService) => {
          const config = configService.get<ClientProviderOptions>(
            'microservice.clients.cms',
          );

          return config;
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MetaCmsService],
  exports: [MetaCmsService],
})
export class MetaCmsModule {}
