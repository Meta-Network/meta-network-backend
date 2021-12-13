import * as ormconfig from '../src/config/ormconfig';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { loadConfig } from '../src/config/configuration';
import { HexGridModule } from '../src/scheduler/hex-grid/hex-grid.module';
import { Connection, EntityManager } from 'typeorm';
import { HexGrid } from '../src/entities/hex-grid.entity';
import { TypeOrmHexGridStorage } from '../src/scheduler/hex-grid/hex-grid-storage-typeorm';
import { HexGridPendingEntity } from '../src/entities/hex-grid-pending.entity';
import { HexGridStorageService } from '../src/scheduler/hex-grid/hex-grid-storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfig],
    }),
    TypeOrmModule.forRoot(ormconfig),
    HexGridModule,
  ],
})
class ScriptModule {}

class Storage extends TypeOrmHexGridStorage {
  constructor(protected entityManager: EntityManager) {
    super(entityManager);
  }

  override async getPendings() {
    const pendings = new Array<HexGridPendingEntity>();

    for (const hexGrid of await this.entityManager.find(HexGrid)) {
      const id = hexGrid.id;

      delete hexGrid.id;
      delete hexGrid.createdAt;
      delete hexGrid.updatedAt;
      delete hexGrid.siteName;
      delete hexGrid.subdomain;
      delete hexGrid.metaSpaceSiteId;
      delete hexGrid.metaSpaceSiteUrl;
      delete hexGrid.metaSpaceSiteProofUrl;

      if (hexGrid.userBio === '') {
        delete hexGrid.userBio;
      }

      if (hexGrid.userAvatar === '') {
        delete hexGrid.userAvatar;
      }

      if (hexGrid.inviterUserId === 0) {
        delete hexGrid.inviterUserId;
      }

      pendings.push({
        id,
        properties: hexGrid,
      });
    }

    return pendings;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(ScriptModule);

  const conn = app.get<Connection>(Connection);
  const storageService = app.get(HexGridStorageService);

  await conn.transaction(async manager => {
    await storageService.uploadPendings(
      new Storage(manager),
    );
  });
}

bootstrap();
