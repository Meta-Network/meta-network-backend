import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncTask } from '../entities/sync-task.entity';
import { SyncTasksService } from './sync-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([SyncTask])],
  providers: [SyncTasksService],
  exports: [SyncTasksService],
})
export class SyncTasksModule {}
