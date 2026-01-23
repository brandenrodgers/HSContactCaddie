import React, { useState, useEffect } from "react";
import {
  Button,
  Divider,
  ErrorState,
  Flex,
  hubspot,
  LoadingSpinner,
  Modal,
  ModalBody,
  Icon,
  StatusTag,
  Box,
  Text,
  Heading,
  EmptyState,
  Alert,
} from "@hubspot/ui-extensions";
import { useCrmProperties } from "@hubspot/ui-extensions/crm";
import { GolfRoundForm } from "./GolfRoundForm";
import { fetchContactGolfRounds, createGolfRound, deleteGolfRound } from "./api";
import { GolfRound, GolfRoundProperties } from "./types";
import { Handicap } from './Handicap';
import { GolfRounds } from './GolfRounds';

const CREATE_GOLF_ROUND_MODAL_ID = 'create-golf-round-modal';

hubspot.extend(({ actions, context }: any) => (
  <Extension actions={actions} context={context} />
));

const Extension = ({ actions, context }: any) => {
  const [golfRounds, setGolfRounds] = useState<GolfRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showGolfRounds, setShowGolfRounds] = useState(false);
  const [isDeletingRound, setIsDeletingRound] = useState<string | null>(null);
  const { properties, isLoading: isLoadingProperties } = useCrmProperties(['firstname']);

  const contactId = context.crm.objectId;
  const portalId = context.portal.id;
  const fetchDomain = context.variables.FETCH_DOMAIN;
  const golfRoundObjectTypeId = context.variables.GOLF_ROUND_OBJECT_TYPE_ID;

  useEffect(() => {
    fetchGolfRounds();
  }, [contactId]);

  const fetchGolfRounds = async () => {
    try {
      setError(null);
      const rounds = await fetchContactGolfRounds(fetchDomain, portalId, contactId);
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
      await createGolfRound(fetchDomain,portalId, contactId, formData);
      await fetchGolfRounds();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsSubmitting(false);
      actions.closeOverlay(CREATE_GOLF_ROUND_MODAL_ID)
    }
  };

  const handleDeleteGolfRound = async (roundId: string) => {
    try {
      setIsDeletingRound(roundId);
      await deleteGolfRound(fetchDomain, portalId, roundId);
      await fetchGolfRounds();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeletingRound(null);
    }
  };

  const renderGolfRoundForm = () => {
    return (
      <Button
        size="medium"
        variant="primary"
        overlay={
          <Modal id={CREATE_GOLF_ROUND_MODAL_ID} title={`Recording a new golf round for ${properties.firstname}`} width="md">
            <ModalBody>
              <Flex direction="column" align="start" gap="medium">
                {createError && (
                  <Alert title="Error creating round" variant="error">
                    {createError}
                  </Alert>
                )}
                <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} firstname={properties.firstname} />
              </Flex>
            </ModalBody>
          </Modal>
        }
      >
        <Icon name="add" /> Record a new round
      </Button>
    );
  };

  if (loading || isLoadingProperties) {
    return (
      <Box>
        <Flex direction="column" align="center" justify="center" gap="medium">
          <LoadingSpinner label="Loading golf rounds..." />
          <Text format={{ fontWeight: "demibold" }}>
            Fetching {properties.firstname ? `${properties.firstname}'s` : 'golf'} rounds...
          </Text>
        </Flex>
      </Box>
    );
  }

  if (golfRounds.length === 0) {
    return (
      <Box>
        {error ? (
          <Flex direction="column" gap="medium">
            <ErrorState title="Trouble fetching golf rounds" type="error">
              <Text>We encountered an issue loading the golf rounds. Please try again.</Text>
              <Button size="medium" onClick={() => {
                setLoading(true);
                fetchGolfRounds()
              }}>
                <Icon name="retry" /> Retry
              </Button>
            </ErrorState>
          </Flex>
        ) : (
          <EmptyState
            title={`Start tracking ${properties.firstname ? `${properties.firstname}'s` : 'golf'} rounds!`}
            layout="vertical"
          >
            <Flex direction="column" align="center" gap="medium">
              <Text>
                <Icon name="star" /> No rounds recorded yet. Record the first round to start tracking handicap and performance!
              </Text>
              {renderGolfRoundForm()}
            </Flex>
          </EmptyState>
        )}
      </Box>
    );
  }

  if (showGolfRounds) {
    return (
      <Box>
        <Flex direction="column" align="start" gap="medium">
          <Button size="small" onClick={() => setShowGolfRounds(false)} variant="secondary">
            <Icon name="left" /> Back to handicap
          </Button>
          <GolfRounds
            golfRounds={golfRounds}
            showGolfRounds={showGolfRounds}
            golfRoundObjectTypeId={golfRoundObjectTypeId}
            onDeleteRound={handleDeleteGolfRound}
            isDeletingRound={isDeletingRound}
          />
        </Flex>
      </Box>
    )
  }

  return (
    <Box>
      <Flex direction="column" gap="medium">
        <Handicap golfRounds={golfRounds} firstname={properties.firstname} />
        <Divider />
        <Flex direction="row" gap="medium" justify="center" align="baseline" wrap="wrap">
          {renderGolfRoundForm()}
          <Button size="medium" onClick={() => setShowGolfRounds(true)} variant="secondary">
            <Icon name="view" /> View all rounds
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
