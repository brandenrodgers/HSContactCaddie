import Redis from 'ioredis';
import { Client } from '@hubspot/api-client';
import { GRANT_TYPES, TOKEN_REFRESH_BUFFER_MS } from './constants';

const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

const redis = new Redis(process.env.REDIS_URL || '');

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  portalId: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const hubspotClient = new Client();

function getTokenKey(portalId: string): string {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  return `hubspot:tokens:${env}:${portalId}`;
}

export async function storeTokens(
  portalId: string,
  tokenResponse: OAuthTokenResponse
): Promise<void> {
  const tokenData: TokenData = {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresAt: Date.now() + tokenResponse.expiresIn * 1000,
    portalId,
  };

  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  await redis.set(getTokenKey(portalId), JSON.stringify(tokenData));
  console.log(`Stored tokens for portal ${portalId} (${env} environment)`);
}

export async function getTokens(portalId: string): Promise<TokenData | null> {
  const data = await redis.get(getTokenKey(portalId));
  if (!data) {
    return null;
  }
  return JSON.parse(data) as TokenData;
}

export async function deleteTokens(portalId: string): Promise<void> {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  await redis.del(getTokenKey(portalId));
  console.log(`Deleted tokens for portal ${portalId} (${env} environment)`);
}

async function refreshAccessToken(
  refreshToken: string
): Promise<OAuthTokenResponse> {
  console.log('Refreshing access token');

  const response = await hubspotClient.oauth.tokensApi.create(
    GRANT_TYPES.REFRESH_TOKEN,
    refreshToken,
    undefined,
    CLIENT_ID,
    CLIENT_SECRET
  );

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresIn: response.expiresIn,
  };
}

function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS;
}

export async function getValidAccessToken(
  portalId: string
): Promise<string | null> {
  const tokens = await getTokens(portalId);

  if (!tokens) {
    console.log(`No tokens found for portal ${portalId}`);
    return null;
  }

  if (isTokenExpired(tokens.expiresAt)) {
    console.log(`Token expired for portal ${portalId}, refreshing...`);
    try {
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      await storeTokens(portalId, newTokens);
      return newTokens.accessToken;
    } catch (error) {
      console.error(`Failed to refresh token for portal ${portalId}:`, error);
      await deleteTokens(portalId);
      return null;
    }
  }

  return tokens.accessToken;
}

export async function getAuthorizedHubSpotClient(
  portalId: string
): Promise<Client | null> {
  const accessToken = await getValidAccessToken(portalId);

  if (!accessToken) {
    return null;
  }

  const client = new Client();
  client.setAccessToken(accessToken);
  return client;
}

