import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@hubspot/api-client';
import { GRANT_TYPES } from '@/lib/constants';

const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

type ResponseData = {
  message: string;
  error?: string;
};

const hubspotClient = new Client({
  // basePath: 'https://api.hubapiqa.com', (override for QA environment)
});

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
      error: 'No code parameter provided'
    });
  }

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

  console.log('Retrieving access token result:', getTokensResponse);


  // Set token for the
  // https://www.npmjs.com/package/@hubspot/api-client
  hubspotClient.setAccessToken(getTokensResponse.accessToken);

  return res.status(200).json({
    message: 'OAuth callback received (stub implementation)'
  });
}

