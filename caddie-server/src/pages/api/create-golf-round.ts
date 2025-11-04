import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedHubSpotClient } from '@/lib/tokenStore';
import {
  GOLF_ROUND_OBJECT_TYPE_ID,
  APP_OBJECT_PREFIX,
  GOLF_ROUND_TO_CONTACT_ASSOCIATION_ID,
} from '@/lib/constants';
import {
  handleHubSpotError,
  formatAppObjectProperties,
} from '@/lib/hubspotApiUtils';

type ResponseData = {
  message?: string;
  golfRound?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log('=== CREATE GOLF ROUND HANDLER CALLED ===');
  console.log('Method:', req.method);
  console.log('Query params:', req.query);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    console.log('❌ Invalid method, rejecting request');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { portalId, contactId } = req.query;
  console.log('Extracted portalId:', portalId);

  if (!portalId || typeof portalId !== 'string') {
    console.log('❌ Missing or invalid portalId');
    return res.status(400).json({
      error: 'Missing portalId query parameter',
    });
  }

  if (!contactId || typeof contactId !== 'string') {
    console.log('❌ Missing or invalid contactId');
    return res.status(400).json({
      error: 'Missing contactId query parameter',
    });
  }

  const { course, score, date, holes, slope, course_rating } = req.body;

  if (!course || !score || !date || !holes) {
    console.log(
      '❌ Missing required fields. Course:',
      !!course,
      'Score:',
      !!score,
      'Date:',
      !!date,
      'Holes:',
      !!holes
    );
    return res.status(400).json({
      error: `Missing required field(s): ${!course ? 'course' : ''}, ${!score ? 'score' : ''}, ${!date ? 'date' : ''}, ${!holes ? 'holes' : ''}`,
    });
  }

  try {
    console.log('🔑 Getting authorized HubSpot client for portal:', portalId);
    const hubspotClient = await getAuthorizedHubSpotClient(portalId);

    if (!hubspotClient) {
      console.log('❌ No valid authorization found for portal:', portalId);
      return res.status(401).json({
        error:
          'No valid authorization found for this portal. Please re-authenticate.',
      });
    }
    console.log('✅ HubSpot client authenticated successfully');

    // Create golf round with properly formatted properties
    const propertiesData: Record<string, string> = {
      course,
      score: score.toString(),
      date,
      holes,
    };

    // Add slope if provided
    if (slope !== undefined && slope !== null) {
      propertiesData.slope = slope.toString();
    }

    // Add course rating if provided
    if (course_rating !== undefined && course_rating !== null) {
      propertiesData.course_rating = course_rating.toString();
    }

    const properties = formatAppObjectProperties(
      propertiesData,
      APP_OBJECT_PREFIX
    );

    console.log(
      '🏌️ Creating golf round with properties:',
      JSON.stringify(properties, null, 2)
    );

    const createResponse = await hubspotClient.apiRequest({
      method: 'POST',
      path: `/crm/v3/objects/${GOLF_ROUND_OBJECT_TYPE_ID}`,
      body: { properties },
    });

    // Handle create response
    if (!createResponse.ok) {
      return await handleHubSpotError(createResponse, res, 'Create golf round');
    }

    const createdRound = await createResponse.json();
    console.log('✅ Golf round created with ID:', createdRound.id);

    // Fetch fresh association labels to get new typeIds
    console.log('🔍 Fetching association labels...');
    const labelsResponse = await hubspotClient.apiRequest({
      method: 'GET',
      path: `/crm/v4/associations/${GOLF_ROUND_OBJECT_TYPE_ID}/contacts/labels`,
    });
    if (labelsResponse.ok) {
      const labelsData = await labelsResponse.json();
      console.log(
        '📋 Association labels:',
        JSON.stringify(labelsData, null, 2)
      );
    }

    // Associate the new golf round with contact
    console.log(
      '🔗 Associating golf round',
      createdRound.id,
      'with contact',
      contactId
    );

    const associationResponse = await hubspotClient.apiRequest({
      method: 'PUT',
      path: `/crm/v4/objects/${GOLF_ROUND_OBJECT_TYPE_ID}/${createdRound.id}/associations/contacts/${contactId}`,
      body: [
        {
          associationCategory: 'INTEGRATOR_DEFINED',
          associationTypeId: GOLF_ROUND_TO_CONTACT_ASSOCIATION_ID,
        },
      ],
    });

    // Handle association response
    if (!associationResponse.ok) {
      return await handleHubSpotError(
        associationResponse,
        res,
        'Associate golf round with contact'
      );
    }

    console.log('✅ Golf round created and associated successfully!');
    return res.status(201).json({
      message: 'Golf round created successfully',
      golfRound: createdRound,
    });
  } catch (error) {
    console.error('❌ ERROR creating golf round:', error);
    if (error instanceof Error && 'stack' in error) {
      console.error('Stack trace:', error.stack);
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
