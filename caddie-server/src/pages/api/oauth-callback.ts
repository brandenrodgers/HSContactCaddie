import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@hubspot/api-client';

const GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
};

const REDIRECT_URI = `${process.env.DOMAIN}/api/oauth-callback`;
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

  console.log('Retrieving access token by code:', code);

  const getTokensResponse = await hubspotClient.oauth.tokensApi.create(
    GRANT_TYPES.AUTHORIZATION_CODE,
    code,
    REDIRECT_URI,
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

