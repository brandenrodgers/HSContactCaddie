import { hubspot } from "@hubspot/ui-extensions";
import { GolfRound, GolfRoundProperties } from "./types";

const handleApiError = async (response: Response): Promise<string> => {
  let errorMessage = '';

  try {
    const text = await response.text();
    console.log('Raw response body:', text);
    console.log('Response body length:', text.length);

    if (!text || text.length === 0) {
      console.error('Response body is empty!');
      return `${response.status} ${response.statusText} (empty response body)`;
    }

    const errorDetails = JSON.parse(text);
    console.log('Parsed error details:', errorDetails);
    errorMessage = errorDetails.error || response.statusText;
  } catch (parseError) {
    console.error('Failed to parse error response:', parseError);
    errorMessage = `${response.status} ${response.statusText} (response body empty or invalid)`;
  }

  return errorMessage;
}

export const fetchContactGolfRounds = async (
  portalId: number,
  contactId: number
): Promise<GolfRound[]> => {
  const response = await hubspot.fetch(
    `https://api.hubapi.com/api/fetch-golf-rounds?portalId=${portalId}&contactId=${contactId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorMessage = await handleApiError(response);
    throw new Error(`Failed to fetch golf rounds: ${errorMessage}`);
  }

  const data: any = await response.json();
  return data.golfRounds || [];
};

export const createGolfRound = async (
  portalId: number,
  contactId: number,
  formData: GolfRoundProperties
): Promise<void> => {
  const response = await hubspot.fetch(
    `https://api.hubapi.com/api/create-golf-round?portalId=${portalId}&contactId=${contactId}`,
    {
      method: "POST",
      body: {
        course: formData.course,
        score: formData.score,
        date: formData.date,
        holes: formData.holes,
        slope: formData.slope,
        course_rating: formData.course_rating,
      },
    }
  );

  if (!response.ok) {
    const errorMessage = await handleApiError(response);
    throw new Error(`Failed to create golf round: ${errorMessage}`);
  }
};

