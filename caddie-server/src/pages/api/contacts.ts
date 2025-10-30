import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedHubSpotClient } from '@/lib/tokenStore';

type ResponseData = {
  message?: string;
  contacts?: any[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { portalId } = req.query;

  if (!portalId || typeof portalId !== 'string') {
    return res.status(400).json({
      error: 'Missing portalId query parameter',
    });
  }

  try {
    // Get an authorized HubSpot client (automatically refreshes token if needed)
    const hubspotClient = await getAuthorizedHubSpotClient(portalId);

    if (!hubspotClient) {
      return res.status(401).json({
        error: 'No valid authorization found for this portal. Please re-authenticate.',
      });
    }

    // Example: Fetch contacts
    const contactsResponse = await hubspotClient.crm.contacts.basicApi.getPage(
      10, // limit
      undefined, // after
      ['firstname', 'lastname', 'email'] // properties
    );

    return res.status(200).json({
      message: 'Contacts retrieved successfully',
      contacts: contactsResponse.results,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

