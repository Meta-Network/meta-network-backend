import {
  ClientProvider,
  ClientProviderOptions,
  ClientsModule,
  ClientsModuleOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import * as fs from 'fs';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { HexGridsModule } from './hex-grids/hex-grids.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

import * as ormconfig from './config/ormconfig';

const { combine, timestamp, printf, metadata, label } = winston.format;

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
});

const { migrations, ...appOrmConfig } = ormconfig as Record<string, any>;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
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
        useFactory: async (configService: ConfigService) =>
          configService.get<ClientProviderOptions>(
            'microservice.clients.ucenter',
          ),
        inject: [ConfigService],
      },
    ]),
    // Database Module Configuration
    TypeOrmModule.forRoot(appOrmConfig),
    AuthModule,
    HexGridsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
