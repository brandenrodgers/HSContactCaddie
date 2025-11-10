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
} from "@hubspot/ui-extensions";
import { useCrmProperties } from "@hubspot/ui-extensions/crm";
import { GolfRoundForm } from "./GolfRoundForm";
import { fetchContactGolfRounds, createGolfRound } from "./api";
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

  const renderGolfRoundForm = () => {
    return (
      <Button
        size="small"
        variant="primary"
        overlay={
          <Modal id={CREATE_GOLF_ROUND_MODAL_ID} title={`New golf round for ${properties.firstname}`} width="md">
            <ModalBody>
              <Flex direction="column" align="start" gap="medium">
                <GolfRoundForm onSubmit={handleCreateGolfRound} isSubmitting={isSubmitting} firstname={properties.firstname} />
                {createError && <StatusTag variant="danger">{createError}</StatusTag>}
              </Flex>
            </ModalBody>
          </Modal>
        }
      >
        <Icon name="edit" /> Record a new round
      </Button>
    );
  };

  if (loading || isLoadingProperties) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner label="Loading golf rounds..." />
      </Flex>
    );
  }

  if (golfRounds.length === 0) {
    return (
      <Flex direction="column" align="center" gap="medium">
        {error ? (
          <ErrorState title="Trouble fetching golf rounds" type="error">
            <Button size="small" onClick={() => {
              setLoading(true);
              fetchGolfRounds()
            }}>
              Try reloading rounds
            </Button>
          </ErrorState>
        ) : (
          <StatusTag variant="warning">No rounds recorded for {properties.firstname}. Record the first round to get started!</StatusTag>
        )}
        {renderGolfRoundForm()}
      </Flex>
    );
  }

  if (showGolfRounds) {
    return (
      <Flex direction="column" align="start" gap="small">
        <Button size="extra-small" onClick={() => setShowGolfRounds(false)} variant="secondary">
          <Icon name="left" /> Back to handicap
        </Button>
        <GolfRounds golfRounds={golfRounds} showGolfRounds={showGolfRounds} golfRoundObjectTypeId={golfRoundObjectTypeId} />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="small">
      <Handicap golfRounds={golfRounds} firstname={properties.firstname} />
      <Divider />
      <Flex direction="row" gap="small" justify="center" align="baseline">
        {renderGolfRoundForm()}
        <Button size="small" onClick={() => setShowGolfRounds(true)}>
          <Icon name="view" /> View rounds
        </Button>
      </Flex>
    </Flex>
  );
};
