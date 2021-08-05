import fs from 'fs';
import path from 'path';

export const JWT_KEY = {
  publicKey: fs.readFileSync(path.join(__dirname, '../../JWT_PUBLIC_KEY.pub')),
};
