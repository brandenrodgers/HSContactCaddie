import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedHubSpotClient } from '@/lib/tokenStore';
import {
  GOLF_ROUND_OBJECT_TYPE,
  GOLF_ROUND_OBJECT_TYPE_ID,
  APP_OBJECT_PREFIX,
} from '@/lib/constants';
import {
  handleHubSpotError,
  stripAppObjectPrefix,
} from '@/lib/hubspotApiUtils';

type ResponseData = {
  message?: string;
  golfRounds?: any[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { portalId, contactId } = req.query;

  if (!portalId || typeof portalId !== 'string') {
    return res.status(400).json({
      error: 'Missing portalId query parameter',
    });
  }

  if (!contactId || typeof contactId !== 'string') {
    return res.status(400).json({
      error: 'Missing contactId query parameter',
    });
  }

  try {
    const hubspotClient = await getAuthorizedHubSpotClient(portalId);

    if (!hubspotClient) {
      return res.status(401).json({
        error:
          'No valid authorization found for this portal. Please re-authenticate.',
      });
    }

    // Fetch associations between contact and golf rounds
    const associationsResponse = await hubspotClient.apiRequest({
      method: 'GET',
      path: `/crm/v4/objects/contacts/${contactId}/associations/${GOLF_ROUND_OBJECT_TYPE_ID}`,
    });

    if (!associationsResponse.ok) {
      return await handleHubSpotError(
        associationsResponse,
        res,
        'Fetch golf round associations'
      );
    }

    const associationsData = await associationsResponse.json();

    if (!associationsData.results || associationsData.results.length === 0) {
      return res.status(200).json({
        message: 'No golf rounds found',
        golfRounds: [],
      });
    }

    // Fetch golf round details in batch
    const roundIds = associationsData.results.map((r: any) => r.toObjectId);

    const roundsResponse = await hubspotClient.apiRequest({
      method: 'POST',
      path: `/crm/v3/objects/${GOLF_ROUND_OBJECT_TYPE}/batch/read`,
      body: {
        inputs: roundIds.map((id: string) => ({ id })),
        properties: [
          `${APP_OBJECT_PREFIX}_course`,
          `${APP_OBJECT_PREFIX}_score`,
          `${APP_OBJECT_PREFIX}_date`,
          `${APP_OBJECT_PREFIX}_holes`,
          `${APP_OBJECT_PREFIX}_slope`,
          `${APP_OBJECT_PREFIX}_course_rating`,
        ],
      },
    });

    if (!roundsResponse.ok) {
      return await handleHubSpotError(
        roundsResponse,
        res,
        'Batch read golf rounds'
      );
    }

    const roundsData = await roundsResponse.json();

    // Strip the app prefix from properties for cleaner frontend consumption
    const cleanedRounds = (roundsData.results || []).map((round: any) => ({
      ...round,
      properties: stripAppObjectPrefix(round.properties, APP_OBJECT_PREFIX),
    }));

    return res.status(200).json({
      message: 'Golf rounds retrieved successfully',
      golfRounds: cleanedRounds,
    });
  } catch (error) {
    console.error('Error fetching golf rounds:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
