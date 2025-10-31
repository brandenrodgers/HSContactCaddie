import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedHubSpotClient } from '@/lib/tokenStore';
import { GOLF_ROUND_OBJECT_TYPE, GOLF_ROUND_OBJECT_TYPE_ID } from '@/lib/constants';

type ResponseData = {
  message?: string;
  golfRound?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { portalId } = req.query;

  if (!portalId || typeof portalId !== 'string') {
    return res.status(400).json({
      error: 'Missing portalId query parameter',
    });
  }

  const { contactId, course, score, date } = req.body;

  if (!contactId || typeof contactId !== 'string') {
    return res.status(400).json({
      error: 'Missing contactId in request body',
    });
  }

  if (!course || !score || !date) {
    return res.status(400).json({
      error: 'Missing required fields: course, score, date',
    });
  }

  try {
    const hubspotClient = await getAuthorizedHubSpotClient(portalId);

    if (!hubspotClient) {
      return res.status(401).json({
        error: 'No valid authorization found for this portal. Please re-authenticate.',
      });
    }

    // Create golf round
    const createResponse = await hubspotClient.apiRequest({
      method: 'POST',
      path: `/crm/v3/objects/${GOLF_ROUND_OBJECT_TYPE}`,
      body: {
        properties: {
          course,
          score: score.toString(),
          date,
        },
      },
    });

    const createdRound = await createResponse.json();

    // Associate golf round with contact
    await hubspotClient.apiRequest({
      method: 'PUT',
      path: `/crm/v4/objects/${GOLF_ROUND_OBJECT_TYPE_ID}/${createdRound.id}/associations/default/contacts/${contactId}`,
    });

    return res.status(201).json({
      message: 'Golf round created successfully',
      golfRound: createdRound,
    });
  } catch (error) {
    console.error('Error creating golf round:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

