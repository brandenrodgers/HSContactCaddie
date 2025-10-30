import React, { useState, useEffect } from "react";
import {
  Divider,
  EmptyState,
  Flex,
  Heading,
  hubspot,
  LoadingSpinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@hubspot/ui-extensions";
import { GolfRoundForm } from "./GolfRoundForm";

hubspot.extend(({ context, actions }: any) => (
  <Extension context={context} sendAlert={actions.addAlert} />
));

interface GolfRound {
  id: string;
  properties: {
    course: string;
    score: string;
    date: string;
  };
}

const Extension = ({ context, sendAlert }: any) => {
  const [golfRounds, setGolfRounds] = useState<GolfRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactId = context.crm.objectId;

  useEffect(() => {
    fetchGolfRounds();
  }, [contactId]);

  const fetchGolfRounds = async () => {
    try {
      setLoading(true);
      setError(null);

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
        const roundIds = data.results.map((r) => r.toObjectId);

        const requestBody = {
          inputs: roundIds.map((id: string) => ({ id })),
          properties: ["course", "score", "date"],
        };

        const roundsResponse = await hubspot.fetch(
          `/crm/v3/objects/golf_round/batch/read`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: requestBody,
          }
        );

        if (!roundsResponse.ok) {
          throw new Error(`Failed to fetch round details: ${roundsResponse.statusText}`);
        }

        const roundsData: any = await roundsResponse.json();
        setGolfRounds(roundsData.results || []);
      } else {
        setGolfRounds([]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching golf rounds:", err);
      sendAlert({
        type: "danger",
        title: "Error Loading Golf Rounds",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGolfRound = async (formData: {
    course: string;
    score: number;
    date: string;
  }) => {
    try {
      setIsSubmitting(true);

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

      const createdRound = await createResponse.json();

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

      sendAlert({
        type: "success",
        title: "Golf Round Recorded",
        message: `Successfully recorded round at ${formData.course}`,
      });

      await fetchGolfRounds();
    } catch (err) {
      console.error("Error creating golf round:", err);
      sendAlert({
        type: "danger",
        title: "Error Recording Golf Round",
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner label="Loading golf rounds..." />
      </Flex>
    );
  }

  if (error && golfRounds.length === 0) {
    return (
      <Flex direction="column" gap="medium">
        <Text>Error loading golf rounds. Please try again.</Text>
        <Divider />
        <Heading>Record a New Round</Heading>
        <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} />
      </Flex>
    );
  }

  if (golfRounds.length === 0) {
    return (
      <Flex direction="column" gap="medium">
        <EmptyState
          title="No Golf Rounds Yet"
          layout="vertical"
        >
          <Text>This contact hasn't recorded any golf rounds yet.</Text>
        </EmptyState>
        <Divider />
        <Heading>Record Your First Round</Heading>
        <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="medium">
      <Heading>Golf Rounds</Heading>
      <Table bordered={true}>
        <TableHead>
          <TableRow>
            <TableHeader>Course</TableHeader>
            <TableHeader>Score</TableHeader>
            <TableHeader>Date</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {golfRounds.map((round) => (
            <TableRow key={round.id}>
              <TableCell>{round.properties.course || "N/A"}</TableCell>
              <TableCell>{round.properties.score || "N/A"}</TableCell>
              <TableCell>
                {round.properties.date
                  ? new Date(round.properties.date).toLocaleDateString()
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Divider />
      <Heading>Record a New Round</Heading>
      <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} />
    </Flex>
  );
};
