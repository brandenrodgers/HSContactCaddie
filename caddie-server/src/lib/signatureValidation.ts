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
  // Always return true when running locally
  const host = req.headers.host;
  if (host?.includes('localhost') || process.env.NODE_ENV === 'development') {
    return true;
  }

  const signatureHeader = req.headers['x-hubspot-signature-v3'];
  const timestampHeader = req.headers['x-hubspot-request-timestamp'];

  if (!signatureHeader || !timestampHeader) {
    console.error('Signature and timestamp headers are required');
    return false;
  }

  try {
    // Construct the full URL, handling proxies (like Vercel) and local development
    const protocol = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
    const urlPath = req.url || '';

    // Extract hostname (without port) to match Express behavior in the docs example
    // In Express, req.hostname doesn't include the port, but req.headers.host does
    const hostname = host?.split(':')[0] || host;

    // Decode URL-encoded characters as required by HubSpot v3 signature validation
    const decodedUrl = decodeHubSpotUri(urlPath);
    const fullUrl = `${protocol}://${hostname}${decodedUrl}`;

    // Get request body - for GET requests, always use empty string
    // For other methods, use JSON.stringify if body exists, otherwise empty string
    let requestBody = '';
    if (req.method && req.method.toUpperCase() !== 'GET') {
      requestBody = req.body === undefined || req.body === null ? '' : JSON.stringify(req.body);
    }

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
      console.error('  Attempted URL:', fullUrl);
      console.error('  Attempted body:', requestBody);
      return false;
    }

    console.log('✅ Signature validation passed');
    return true;
  } catch (error) {
    console.error('Signature validation failed:', error);
    return false;
  }
};
