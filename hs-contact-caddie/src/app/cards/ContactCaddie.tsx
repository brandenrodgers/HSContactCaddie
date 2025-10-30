import React from "react";
import { EmptyState, Link, Text } from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";

hubspot.extend(({ context }) => <Extension context={context} />);

const Extension = ({ context }) => {

  console.log({context});

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
      </EmptyState>
    </>
  );
};
