import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { HexGrid } from '../entities/hex-grid.entity';
import loadConfig from './configuration';

class Config {
  db: DB;
}

class DB {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connect_timeout: number;
}

const { db } = loadConfig();
const ca = readFileSync('rds-ca-2019-root.pem').toString();
// console.log(db);
// console.log(ca);

module.exports = {
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
  entities: [HexGrid],
  migrations: ['*.ts'],
  cli: {
    migrationsDir: 'migration',
  },
};
