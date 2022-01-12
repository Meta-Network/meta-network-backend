import { readFileSync } from 'fs';
import { join } from 'path';

import { HexGrid } from '../entities/hex-grid.entity';
import { HexGridBatchTxEntity } from '../entities/hex-grid-batch-tx.entity';
import { HexGridPendingEntity } from '../entities/hex-grid-pending.entity';
import { HexGridTransactionReferenceEntity } from '../entities/hex-grid-tx-ref.entity';
import { SyncTask } from '../entities/sync-task.entity';
import { CONFIG_PATH, loadConfig } from './configuration';

const { db } = loadConfig();
const ca = readFileSync(join(CONFIG_PATH, 'rds-ca-2019-root.pem')).toString();

module.exports =
  process.env.NODE_ENV === 'test'
    ? {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        dropSchema: true,
        // 设置keepConnectionAlive来避免AlreadyHasActiveConnectionError
        keepConnectionAlive: true,
        entities: [
          HexGrid,
          SyncTask,
          HexGridPendingEntity,
          HexGridBatchTxEntity,
          HexGridTransactionReferenceEntity,
        ],
      }
    : {
        type: 'mysql',
        host: db.host,
        ssl: {
          rejectUnauthorized: true,
          ca: ca,
        },
        port: db.port || 3306,
        username: db.username,
        password: db.password,
        database: db.database,
        charset: db.charset || 'utf8mb4',
        connectTimeout: db.connect_timeout,
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
        entities: [
          HexGrid,
          SyncTask,
          HexGridPendingEntity,
          HexGridBatchTxEntity,
          HexGridTransactionReferenceEntity,
        ],
      };
