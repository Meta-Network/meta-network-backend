import * as chokidar from 'chokidar';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

import { CONFIG_PATH } from '../config/configuration';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.biz.production.yaml'
    : 'config.biz.development.yaml';

export const WATCHER = chokidar.watch(join(CONFIG_PATH, YAML_CONFIG_FILENAME));
export function loadConfig() {
  return yaml.load(
    // '__dirname/../..' refers to project root folder
    readFileSync(join(CONFIG_PATH, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
}
