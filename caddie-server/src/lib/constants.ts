export const GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry

export const GOLF_ROUND_OBJECT_PREFIX = process.env.HUBSPOT_GOLF_ROUND_OBJECT_PREFIX;
export const GOLF_ROUND_OBJECT_TYPE = `${GOLF_ROUND_OBJECT_PREFIX}_GOLF_ROUND`;
export const GOLF_ROUND_OBJECT_TYPE_ID = process.env.HUBSPOT_GOLF_ROUND_OBJECT_TYPE_ID;
export const GOLF_ROUND_TO_CONTACT_ASSOCIATION_ID = process.env.HUBSPOT_GOLF_ROUND_TO_CONTACT_ASSOCIATION_ID;
