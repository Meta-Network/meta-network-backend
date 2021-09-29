import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppController } from './app.controller';
import { AppMsController } from './app.ms.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { loadConfig } from './config/configuration';
// eslint-disable-next-line import/namespace
import * as ormconfig from './config/ormconfig';
import { ConfigBizModule } from './config-biz/config-biz.module';
import { HealthController } from './health/health.controller';
import { HexGridsModule } from './hex-grids/hex-grids.module';
import { SyncTasksModule } from './sync-tasks/sync-tasks.module';

const { combine, timestamp, printf, metadata, label } = winston.format;

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfig],
    }),
    // Logger Module Configuration
    WinstonModule.forRoot({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(
        label({ label: 'Meta-Network' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      ),
      transports: [
        new winston.transports.Console({
          format: combine(winston.format.colorize(), logFormat),
        }),
        new winston.transports.File({
          filename: '/var/log/meta-network/app.log',
          format: combine(
            // Render in one line in your log file.
            // If you use prettyPrint() here it will be really
            // difficult to exploit your logs files afterwards.
            winston.format.json(),
          ),
        }),
      ],
      exitOnError: false,
    }),
    EventEmitterModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'UCENTER_MS_CLIENT',
        imports: [ConfigModule],

        useFactory: async (configService: ConfigService) => {
          const config = configService.get<ClientProviderOptions>(
            'microservice.clients.ucenter',
          );
          console.log(config);
          return config;
        },
        inject: [ConfigService],
      },
      {
        name: 'CMS_MS_CLIENT',
        imports: [ConfigModule],

        useFactory: async (configService: ConfigService) => {
          const config = configService.get<ClientProviderOptions>(
            'microservice.clients.cms',
          );
          console.log(config);
          return config;
        },
        inject: [ConfigService],
      },
    ]),
    // Database Module Configuration
    TypeOrmModule.forRoot(ormconfig),
    ScheduleModule.forRoot(),
    TerminusModule,
    AuthModule,
    HexGridsModule,
    ConfigBizModule,
    SyncTasksModule,
  ],
  controllers: [AppController, AppMsController, HealthController],
  providers: [AppService],
})
export class AppModule {}
