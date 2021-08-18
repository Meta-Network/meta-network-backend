import { Module } from '@nestjs/common';
import { SyncTasksService } from './sync-tasks.service';
import { SyncTasksController } from './sync-tasks.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';

@Module({
  controllers: [SyncTasksController],
  providers: [SyncTasksService],
})
export class SyncTasksModule {}
