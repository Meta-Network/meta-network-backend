import { readFileSync } from 'fs';

import { HexGrid } from '../entities/hex-grid.entity';
import { SyncTask } from '../entities/sync-task.entity';
import loadConfig from './configuration';

const { db } = loadConfig();
const ca = readFileSync('rds-ca-2019-root.pem').toString();

module.exports =
  process.env.NODE_ENV === 'test'
    ? {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        dropSchema: true,
        // 设置keepConnectionAlive来避免AlreadyHasActiveConnectionError
        keepConnectionAlive: true,
        entities: [HexGrid, SyncTask],
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
        connectTimeout: db.connect_timeout,
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
        entities: [HexGrid, SyncTask],
      };
