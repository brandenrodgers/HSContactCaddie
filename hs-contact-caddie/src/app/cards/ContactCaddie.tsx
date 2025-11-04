import React, { useState, useEffect } from "react";
import {
  Accordion,
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
import { useCrmProperties } from "@hubspot/ui-extensions/crm";
import { GolfRoundForm } from "./GolfRoundForm";
import { fetchContactGolfRounds, createGolfRound } from "./api";
import { GolfRound, GolfRoundProperties } from "./types";
import { Handicap } from './Handicap';

hubspot.extend(({ context, actions }: any) => (
  <Extension context={context} sendAlert={actions.addAlert} />
));

const Extension = ({ context, sendAlert }: any) => {
  const [golfRounds, setGolfRounds] = useState<GolfRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { properties, isLoading: isLoadingProperties } = useCrmProperties(['firstname']);

  const contactId = context.crm.objectId;
  const portalId = context.portal.id;

  useEffect(() => {
    fetchGolfRounds();
  }, [contactId]);

  const fetchGolfRounds = async () => {
    try {
      setError(null);
      const rounds = await fetchContactGolfRounds(portalId, contactId);
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

  const handleCreateGolfRound = async (formData: GolfRoundProperties) => {
    try {
      setIsSubmitting(true);
      await createGolfRound(portalId, contactId, formData);
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

  if (loading || isLoadingProperties) {
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
        <Accordion title="Record a New Round">
          <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} />
        </Accordion>
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
      <Handicap golfRounds={golfRounds} firstname={properties.firstname} />
      <Divider />
      <Flex direction="row" gap="extra-small" justify="between" align="baseline">
        <Heading>Golf Rounds</Heading>
        <Text>Showing the last 20 rounds played</Text>
      </Flex>
      <Table bordered={true}>
        <TableHead>
          <TableRow>
            <TableHeader>Course</TableHeader>
            <TableHeader>Score</TableHeader>
            <TableHeader>Holes</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Rating</TableHeader>
            <TableHeader>Slope</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {golfRounds.slice(0, 20).map((round) => (
            <TableRow key={round.id}>
              <TableCell>{round.properties.course}</TableCell>
              <TableCell>{round.properties.score}</TableCell>
              <TableCell>{round.properties.holes || "N/A"}</TableCell>
              <TableCell>
                {round.properties.date
                  ? new Date(round.properties.date).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>{round.properties.course_rating || "-"}</TableCell>
              <TableCell>{round.properties.slope || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Accordion title="Record a New Round">
        <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} />
      </Accordion>
    </Flex>
  );
};
