import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.production.yaml'
    : 'config.development.yaml';

export default () => {
  return yaml.load(
    // '__dirname/../..' refers to project root folder
    readFileSync(join(__dirname, '..', '..', YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};
