import fs from 'fs';
import path from 'path';
/**
 * 身份认证用的 JWT_KEY
 */
export const JWT_KEY = {
  publicKey: fs.readFileSync(path.join(__dirname, '../../JWT_PUBLIC_KEY.pub')),
};
/**
 * 地图最大坐标
 */
export const HEX_GRID_COORDINATE_MAX = 1_000_000;

export const HEX_GRID_CONFIG_PATH = 'config.hex-grid.yaml';
