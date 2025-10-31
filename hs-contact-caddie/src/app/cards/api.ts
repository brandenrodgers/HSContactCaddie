import { hubspot } from "@hubspot/ui-extensions";
import { GolfRound } from "./types";

export const fetchContactGolfRounds = async (
  portalId: number,
  contactId: string
): Promise<GolfRound[]> => {
  const response = await hubspot.fetch(
    `https://api.hubapi.com/api/get-golf-rounds?portalId=${portalId}&contactId=${contactId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`Failed to fetch golf rounds: ${response.statusText}`, error);
    throw new Error(`Failed to fetch golf rounds: ${response.statusText}`);
  }

  const data: any = await response.json();
  return data.golfRounds || [];
};

export const createGolfRound = async (
  portalId: number,
  contactId: string,
  formData: {
    course: string;
    score: number;
    date: string;
  }
): Promise<void> => {
  const response = await hubspot.fetch(
    `https://api.hubapi.com/api/add-golf-round?portalId=${portalId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        contactId,
        course: formData.course,
        score: formData.score,
        date: formData.date,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`Failed to create golf round: ${response.statusText}`, error);
    throw new Error(`Failed to create golf round: ${response.statusText}`);
  }
};

