import type { NextApiRequest } from 'next';
import { Signature } from '@hubspot/api-client';

export const validateRequestSignature = (req: NextApiRequest): boolean => {
  const signatureHeader = req.headers['x-hubspot-signature-v3'];
  const timestampHeader = req.headers['x-hubspot-request-timestamp'];

  if (!signatureHeader || !timestampHeader) {
    console.error('Signature and timestamp headers are required');
    return false;
  }

  try {
    // Construct the full URL, handling proxies (like Vercel) and local development
    const protocol = req.headers['x-forwarded-proto'] || (req.headers.host?.includes('localhost') ? 'http' : 'https');

    const isValid = Signature.isValid({
      signatureVersion: 'v3',
      signature: signatureHeader as string,
      timestamp: Number(timestampHeader),
      method: req.method,
      url: `${protocol}://${req.headers.host}${req.url}`,
      requestBody: JSON.stringify(req.body),
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET as string,
    });

    if (!isValid) {
      console.error('Signature validation failed');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Signature validation failed:', error);
    return false;
  }
};
