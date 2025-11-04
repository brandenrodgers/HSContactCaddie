export const GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry

export const APP_OBJECT_PREFIX = 'a23328082';
export const GOLF_ROUND_OBJECT_TYPE = `${APP_OBJECT_PREFIX}_GOLF_ROUND`;
export const GOLF_ROUND_OBJECT_TYPE_ID = '1-7966425';
export const GOLF_ROUND_TO_CONTACT_ASSOCIATION_ID = 1000703; //(dev): 1000677; // "Player" labeled association
