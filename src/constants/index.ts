import fs from 'fs';
import path from 'path';

export const JWT_KEY = {
  publicKey: fs.readFileSync(path.join(__dirname, '../../JWT_PUBLIC_KEY.pub')),
};

export const HEX_GRID_D = 1_000_000;
