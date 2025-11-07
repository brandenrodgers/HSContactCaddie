import type { NextApiResponse } from 'next';
import { Response } from 'node-fetch';

export interface HubSpotErrorResponse {
  error: string;
  status: number;
  details?: any;
  correlationId?: string;
}

/**
 * Handles a failed HubSpot API response and sends an appropriate error to the client
 */
export async function handleHubSpotError(
  response: Response,
  res: NextApiResponse,
  context: string = 'HubSpot API request'
): Promise<void> {
  console.error(`❌ ${context} failed`);
  console.error('Response status:', response.status, response.statusText);

  // Read response body as text first to avoid double-reading issues
  const responseText = await response.text();
  console.error('Response body:', responseText);

  let errorData: any;
  try {
    // Try to parse as JSON
    errorData = JSON.parse(responseText);
    console.error('Parsed error data:', JSON.stringify(errorData, null, 2));
  } catch (parseError) {
    // Not valid JSON, use as plain text
    console.error('Response was not valid JSON');
    errorData = { message: responseText || 'Unknown error' };
  }

  // Extract useful error information
  const errorMessage = errorData?.message || errorData?.error || response.statusText || 'Unknown error';

  const errorResponse: HubSpotErrorResponse = {
    error: errorMessage,
    status: response.status,
    details: errorData?.errors || errorData?.details,
    correlationId: errorData?.correlationId,
  };

  console.error('Sending error response:', JSON.stringify(errorResponse, null, 2));

  res.status(response.status || 500).json(errorResponse);
}

/**
 * Safely parses a HubSpot API response, handling both success and error cases
 */
export async function parseHubSpotResponse<T = any>(
  response: Response,
  context: string = 'HubSpot API request'
): Promise<{ success: true; data: T } | { success: false; error: any }> {
  if (!response.ok) {
    console.error(`❌ ${context} failed with status:`, response.status);

    const responseText = await response.text();
    let errorData: any;

    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { message: responseText || 'Unknown error' };
    }

    return {
      success: false,
      error: errorData,
    };
  }

  try {
    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (parseError) {
    console.error(`❌ ${context} response parsing failed:`, parseError);
    return {
      success: false,
      error: { message: 'Failed to parse response' },
    };
  }
}

/**
 * Formats property names with the app prefix for HubSpot custom objects
 */
export function formatAppObjectProperties(properties: Record<string, any>, appPrefix: string): Record<string, any> {
  const formatted: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    // If the property already has the prefix, don't add it again
    if (key.startsWith(appPrefix)) {
      formatted[key] = value;
    } else {
      formatted[`${appPrefix}_${key}`] = value;
    }
  }

  return formatted;
}

/**
 * Strips the app prefix from property names for easier frontend consumption
 */
export function stripAppObjectPrefix(properties: Record<string, any>, appPrefix: string): Record<string, any> {
  const stripped: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (key.startsWith(`${appPrefix}_`)) {
      const cleanKey = key.replace(`${appPrefix}_`, '');
      stripped[cleanKey] = value;
    } else {
      stripped[key] = value;
    }
  }

  return stripped;
}
