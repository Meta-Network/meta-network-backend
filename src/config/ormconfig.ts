import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.production.yaml'
    : 'config.development.yaml';

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

const { db } = yaml.load(readFileSync(YAML_CONFIG_FILENAME, 'utf8')) as Config;
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
  entities: ['dist/**/*.entity.ts'],
  migrations: ['dist/migration/**/*.ts'],
  cli: {
    migrationsDir: 'migration',
  },
};
