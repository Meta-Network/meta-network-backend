// eslint-disable-next-line import/namespace
import * as ormconfig from './ormconfig';
module.exports = {
  ...ormconfig,
  migrations: ['migration/**.ts'],
  cli: {
    migrationsDir: 'migration',
  },
};
