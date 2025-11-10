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
  console.log('[Signature Validation] Starting validation...');
  console.log('[Signature Validation] NODE_ENV:', process.env.NODE_ENV);

  // Always return true when running locally
  const host = req.headers.host;
  console.log('[Signature Validation] Host header:', host);

  if (host?.includes('localhost') || process.env.NODE_ENV === 'development') {
    console.log('[Signature Validation] Running locally, skipping validation');
    return true;
  }

  const signatureHeader = req.headers['x-hubspot-signature-v3'];
  const timestampHeader = req.headers['x-hubspot-request-timestamp'];

  console.log('[Signature Validation] Headers received:');
  console.log('[Signature Validation]   x-hubspot-signature-v3:', signatureHeader ? 'present' : 'missing');
  console.log('[Signature Validation]   x-hubspot-request-timestamp:', timestampHeader || 'missing');
  console.log('[Signature Validation]   x-forwarded-proto:', req.headers['x-forwarded-proto'] || 'missing');
  console.log('[Signature Validation]   method:', req.method);
  console.log('[Signature Validation]   url:', req.url);

  if (!signatureHeader || !timestampHeader) {
    console.error('[Signature Validation] ❌ Missing required headers');
    console.error('[Signature Validation]   signatureHeader:', signatureHeader ? 'present' : 'MISSING');
    console.error('[Signature Validation]   timestampHeader:', timestampHeader || 'MISSING');
    return false;
  }

  try {
    // Construct the full URL, handling proxies (like Vercel) and local development
    const protocol = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
    const urlPath = req.url || '';

    console.log('[Signature Validation] URL construction:');
    console.log('[Signature Validation]   x-forwarded-proto:', req.headers['x-forwarded-proto'] || 'not set');
    console.log('[Signature Validation]   protocol (resolved):', protocol);
    console.log('[Signature Validation]   urlPath (raw):', urlPath);

    // Extract hostname (without port) to match Express behavior in the docs example
    // In Express, req.hostname doesn't include the port, but req.headers.host does
    const hostname = host?.split(':')[0] || host;
    console.log('[Signature Validation]   hostname (extracted):', hostname);

    // Decode URL-encoded characters as required by HubSpot v3 signature validation
    const decodedUrl = decodeHubSpotUri(urlPath);
    const fullUrl = `${protocol}://${hostname}${decodedUrl}`;
    console.log('[Signature Validation]   decodedUrl:', decodedUrl);
    console.log('[Signature Validation]   fullUrl:', fullUrl);

    // Get request body - for GET requests, always use empty string
    // For other methods, use JSON.stringify if body exists, otherwise empty string
    let requestBody = '';
    if (req.method && req.method.toUpperCase() !== 'GET') {
      requestBody = req.body === undefined || req.body === null ? '' : JSON.stringify(req.body);
    }
    console.log('[Signature Validation] Request body:');
    console.log('[Signature Validation]   method:', req.method);
    console.log('[Signature Validation]   body (raw):', req.body);
    console.log('[Signature Validation]   body (stringified):', requestBody);

    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    console.log('[Signature Validation] Client secret:', clientSecret ? 'present' : 'MISSING');

    const timestamp = Number(timestampHeader);
    console.log('[Signature Validation] Validation inputs:');
    console.log('[Signature Validation]   signature:', signatureHeader);
    console.log('[Signature Validation]   timestamp (raw):', timestampHeader);
    console.log('[Signature Validation]   timestamp (parsed):', timestamp);
    console.log('[Signature Validation]   method:', req.method || 'GET');
    console.log('[Signature Validation]   url:', fullUrl);
    console.log('[Signature Validation]   requestBody:', requestBody);

    const isValid = Signature.isValid({
      signatureVersion: 'v3',
      signature: signatureHeader as string,
      timestamp: timestamp,
      method: req.method || 'GET',
      url: fullUrl,
      requestBody,
      clientSecret: clientSecret as string,
    });

    if (!isValid) {
      console.error('[Signature Validation] ❌ Signature validation failed: signature does not match');
      console.error('[Signature Validation]   Full URL used:', fullUrl);
      console.error('[Signature Validation]   Request body used:', requestBody);
      console.error('[Signature Validation]   Method:', req.method || 'GET');
      console.error('[Signature Validation]   Timestamp:', timestamp);
      return false;
    }

    console.log('[Signature Validation] ✅ Signature validation passed');
    return true;
  } catch (error) {
    console.error('[Signature Validation] ❌ Exception during validation:');
    console.error('[Signature Validation]   Error:', error);
    console.error('[Signature Validation]   Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Signature Validation]   Error stack:', error instanceof Error ? error.stack : 'N/A');
    return false;
  }
};
