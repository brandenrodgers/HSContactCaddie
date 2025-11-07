import type { NextApiRequest } from 'next';
import { Signature } from '@hubspot/api-client';

/**
 * Decodes URL-encoded characters in the URI as required by HubSpot v3 signature validation.
 * According to HubSpot docs, these specific characters must be decoded before signature validation.
 */
const decodeHubSpotUri = (uri: string): string => {
  const decodeMap: Record<string, string> = {
    '%3A': ':',
    '%2F': '/',
    '%3F': '?',
    '%40': '@',
    '%21': '!',
    '%24': '$',
    '%27': "'",
    '%28': '(',
    '%29': ')',
    '%2A': '*',
    '%2C': ',',
    '%3B': ';',
  };

  let decoded = uri;
  for (const [encoded, decodedChar] of Object.entries(decodeMap)) {
    decoded = decoded.replace(new RegExp(encoded, 'g'), decodedChar);
  }
  return decoded;
};

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
    const host = req.headers.host;
    const urlPath = req.url || '';

    // Decode URL-encoded characters as required by HubSpot v3 signature validation
    const decodedUrl = decodeHubSpotUri(urlPath);
    const fullUrl = `${protocol}://${host}${decodedUrl}`;

    // Get request body - use empty string if body is undefined or null
    const requestBody = req.body === undefined || req.body === null ? '' : JSON.stringify(req.body);

    const isValid = Signature.isValid({
      signatureVersion: 'v3',
      signature: signatureHeader as string,
      timestamp: Number(timestampHeader),
      method: req.method || 'GET',
      url: fullUrl,
      requestBody,
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET as string,
    });

    if (!isValid) {
      console.error('Signature validation failed: signature does not match');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Signature validation failed:', error);
    return false;
  }
};
