import React, { useState, useEffect } from "react";
import {
  Accordion,
  Divider,
  EmptyState,
  ErrorState,
  Flex,
  Heading,
  hubspot,
  LoadingSpinner,
  StatusTag,
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

hubspot.extend(({ context }: any) => (
  <Extension context={context} />
));

const Extension = ({ context }: any) => {
  const [golfRounds, setGolfRounds] = useState<GolfRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGolfRound = async (formData: GolfRoundProperties) => {
    try {
      setCreateError(null);
      setIsSubmitting(true);
      await createGolfRound(portalId, contactId, formData);
      await fetchGolfRounds();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGolfRoundForm = () => {
    return (
      <Accordion title="Record a new golf round">
        <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} />
        {createError && <StatusTag variant="danger">{createError}</StatusTag>}
      </Accordion>
    )
  }

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
        <ErrorState
          title="Trouble fetching golf rounds"
          type="error"
        >
          <Text>Try loading the rounds again.</Text>
        </ErrorState>
        <Divider />
        {renderGolfRoundForm()}
      </Flex>
    );
  }

  if (golfRounds.length === 0) {
    return (
      <Flex direction="column" gap="medium">
        <EmptyState
          title="No golf rounds yet"
          layout="vertical"
        >
          <Text>This contact hasn't recorded any golf rounds yet.</Text>
        </EmptyState>
        <Divider />
        {renderGolfRoundForm()}
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="medium">
      <Handicap golfRounds={golfRounds} firstname={properties.firstname} />
      <Divider />
      <Flex direction="row" gap="extra-small" justify="between" align="baseline">
        <Heading>Golf Rounds</Heading>
        <Text>Showing the last {golfRounds.length > 20 ? 20 : golfRounds.length} rounds played</Text>
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
      {renderGolfRoundForm()}
    </Flex>
  );
};
