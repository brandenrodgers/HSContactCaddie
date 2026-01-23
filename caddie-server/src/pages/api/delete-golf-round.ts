import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedHubSpotClient } from '@/lib/tokenStore';
import { GOLF_ROUND_OBJECT_TYPE } from '@/lib/constants';
import { handleHubSpotError } from '@/lib/hubspotApiUtils';
import { validateRequestSignature } from '@/lib/signatureValidation';

type ResponseData = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!validateRequestSignature(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { portalId, roundId } = req.query;

  if (!portalId || typeof portalId !== 'string') {
    return res.status(400).json({
      error: 'Missing portalId query parameter',
    });
  }

  if (!roundId || typeof roundId !== 'string') {
    return res.status(400).json({
      error: 'Missing roundId query parameter',
    });
  }

  try {
    const hubspotClient = await getAuthorizedHubSpotClient(portalId);

    if (!hubspotClient) {
      return res.status(401).json({
        error: 'No valid authorization found for this portal. Please re-authenticate.',
      });
    }

    const deleteResponse = await hubspotClient.apiRequest({
      method: 'DELETE',
      path: `/crm/v3/objects/${GOLF_ROUND_OBJECT_TYPE}/${roundId}`,
    });

    if (!deleteResponse.ok) {
      return await handleHubSpotError(deleteResponse, res, 'Delete golf round');
    }

    return res.status(200).json({
      message: 'Golf round deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting golf round:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
