/**
 * 地图最大坐标
 */
export const HEX_GRID_COORDINATE_MAX = 1_000_000;

export const HEX_GRID_CONFIG_PATH = 'config.hex-grid.yaml';

export enum AppMsEvent {
  USER_PROFILE_MODIFIED = 'user.profile.modified',
  META_SPACE_SITE_CREATED = 'meta.space.site.created',
  META_SPACE_SITE_UPDATED = 'meta.space.site.updated',
  META_SPACE_SITE_PUBLISHED = 'meta.space.site.published',
}

export enum AppMsMethod {
  FIND_HEX_GRID_BY_USER_ID = 'findHexGridByUserId',
}

export enum MetaMicroserviceClient {
  UCENTER = 'UCENTER_MS_CLIENT',
  CMS = 'CMS_MS_CLIENT',
}
export enum UCenterMsClientMethod {
  HELLO = 'hello',
  NEW_INVITATION_SLOT = 'newInvitationSlot',
  SYNC_USER_PROFILE = 'syncUserProfile',
}

export enum CmsMsClientMethod {
  SYNC_SITE_INFO = 'syncSiteInfo',
  FETCH_USER_DEFAULT_SITE_INFO = 'fetchUserDefaultSiteInfo',
}
