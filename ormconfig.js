import { join } from 'path';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.production.yaml'
    : 'config.development.yaml';

const config = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
);

module.exports = {
  type: 'mysql',
  host: config.db.host,
  ssl: {
    rejectUnauthorized: true,
    ca: readFileSync(join(__dirname, 'rds-ca-2019-root.pem'))
      .toString(),
  },
  port: config.db.port || 3306,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['migration/**/*.ts'],
  cli: {
    migrationsDir: 'migration',
  },
};
