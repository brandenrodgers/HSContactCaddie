import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@hubspot/api-client';
import { GRANT_TYPES } from '@/lib/constants';
import { storeTokens } from '@/lib/tokenStore';

const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

type ResponseData = {
  message: string;
  portalId?: string;
  error?: string;
};

const hubspotClient = new Client();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      message: 'Missing authorization code',
      error: 'No code parameter provided',
    });
  }

  try {
    // Dynamically construct the redirect URI from the request headers so it works with Vercel and local development
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const redirectUri = `${protocol}://${host}/api/oauth-callback`;

    console.log('Retrieving access token by code:', code);
    console.log('Using redirect URI:', redirectUri);

    const getTokensResponse = await hubspotClient.oauth.tokensApi.create(
      GRANT_TYPES.AUTHORIZATION_CODE,
      code,
      redirectUri,
      CLIENT_ID,
      CLIENT_SECRET
    );

    console.log('Token exchange successful');

    // Get the access token info to retrieve the portal ID
    hubspotClient.setAccessToken(getTokensResponse.accessToken);
    const tokenInfo = await hubspotClient.oauth.accessTokensApi.get(
      getTokensResponse.accessToken
    );

    const portalId = tokenInfo.hubId.toString();
    console.log(`Storing tokens for portal ${portalId}`);

    // Store tokens in Vercel KV
    await storeTokens(portalId, {
      accessToken: getTokensResponse.accessToken,
      refreshToken: getTokensResponse.refreshToken,
      expiresIn: getTokensResponse.expiresIn,
    });

    console.log(`OAuth flow completed successfully for portal ${portalId}`);

    return res.redirect('/oauth-success');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({
      message: 'OAuth authorization failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
