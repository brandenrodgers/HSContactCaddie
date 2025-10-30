import React from "react";
import { EmptyState, Link, Text } from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";
import { ENVIRONMENTS } from './constants';

hubspot.extend(({ context }) => <Extension context={context} />);

const Extension = ({ context }) => {

  const renderEnvironment = () => {
    switch (context.variables.ENV) {
      case ENVIRONMENTS.DEVELOPMENT:
        return <Text>Development Environment</Text>;
      case ENVIRONMENTS.PRODUCTION:
      default:
        return <Text>Production Environment</Text>;

    }
  };

  return (
    <>
      <EmptyState
        title="Contact Caddie"
        layout="vertical"
        imageName='building'
      >
        <Text>
          Contact Caddie is a golf stats app for HubSpot contacts.
        </Text>
        {renderEnvironment()}
      </EmptyState>
    </>
  );
};
