import fs from 'fs';
import path from 'path';

export const JWT_KEY = {
  privateKey: fs.readFileSync(
    path.join(__dirname, '../../JWT_PRIVATE_KEY.pem'),
  ),
  publicKey: fs.readFileSync(path.join(__dirname, '../../JWT_PUBLIC_KEY.pub')),
};
