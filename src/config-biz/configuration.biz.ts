import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import * as chokidar from 'chokidar';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'production'
    ? 'config.biz.production.yaml'
    : 'config.biz.development.yaml';

export const WATCHER = chokidar.watch(YAML_CONFIG_FILENAME);
export function config() {
  return yaml.load(
    // '__dirname/../..' refers to project root folder
    readFileSync(join(__dirname, '..', '..', YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
}
