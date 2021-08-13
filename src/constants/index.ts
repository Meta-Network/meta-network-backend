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

export enum AppMsEvent {
  USER_PROFILE_MODIFIED = 'user.profile.modified',
  META_SPACE_SITE_CREATED = 'meta.space.site.created',
  META_SPACE_SITE_UPDATED = 'meta.space.site.updated',
}

export enum AppMsMethod {
  FIND_HEX_GRID_BY_USER_ID = 'findHexGridByUserId',
}

export enum UcenterMsClientMethod {
  HELLO = 'hello',
  NEW_INVITATION_SLOT = 'newInvitationSlot',
}
