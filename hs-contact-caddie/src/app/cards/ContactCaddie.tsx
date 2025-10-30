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
import { fetchContactGolfRounds, createGolfRound } from "./api";
import { GolfRound } from "./types";

hubspot.extend(({ context, actions }: any) => (
  <Extension context={context} sendAlert={actions.addAlert} />
));

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
      const rounds = await fetchContactGolfRounds(contactId);
      setGolfRounds(rounds);
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
      await createGolfRound(contactId, formData);
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
