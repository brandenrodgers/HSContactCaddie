import { hubspot } from "@hubspot/ui-extensions";
import { GolfRound } from "./types";


export const fetchContactGolfRounds = async (contactId: string): Promise<GolfRound[]> => {
  const response = await hubspot.fetch(
    `/crm/v4/objects/contacts/${contactId}/associations/golf_round`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch golf rounds: ${response.statusText}`);
  }

  const data: any = await response.json();

  if (data.results && data.results.length > 0) {
    const roundIds = data.results.map((r: any) => r.toObjectId);
    return await fetchGolfRoundsByIds(roundIds);
  }

  return [];
};

const fetchGolfRoundsByIds = async (roundIds: string[]): Promise<GolfRound[]> => {
  const requestBody = {
    inputs: roundIds.map((id: string) => ({ id })),
    properties: ["course", "score", "date"],
  };

  const response = await hubspot.fetch(
    `/crm/v3/objects/golf_round/batch/read`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch round details: ${response.statusText}`);
  }

  const data: any = await response.json();
  return data.results || [];
};

export const createGolfRound = async (
  contactId: string,
  formData: {
    course: string;
    score: number;
    date: string;
  }
): Promise<void> => {
  const createBody = {
    properties: {
      course: formData.course,
      score: formData.score.toString(),
      date: formData.date,
    },
  };

  const createResponse = await hubspot.fetch(`/crm/v3/objects/golf_round`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: createBody,
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create golf round: ${createResponse.statusText}`);
  }

  const createdRound: any = await createResponse.json();

  const associateResponse = await hubspot.fetch(
    `/crm/v4/objects/golf_round/${createdRound.id}/associations/default/contact/${contactId}`,
    {
      method: "PUT",
    }
  );

  if (!associateResponse.ok) {
    throw new Error(
      `Failed to associate golf round with contact: ${associateResponse.statusText}`
    );
  }
};

