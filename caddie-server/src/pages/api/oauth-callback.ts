import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      message: 'Missing authorization code',
      error: 'No code parameter provided'
    });
  }

  // TODO: Implement OAuth token exchange logic here
  // 1. Exchange the authorization code for an access token
  // 2. Store the tokens securely
  // 3. Redirect or respond appropriately

  return res.status(200).json({
    message: 'OAuth callback received (stub implementation)'
  });
}

