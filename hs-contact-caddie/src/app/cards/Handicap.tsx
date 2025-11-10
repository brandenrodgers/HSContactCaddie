import React, { useState, useEffect } from "react";
import { Flex, Statistics, StatisticsItem, StatusTag, Tag, Tooltip, Inline } from "@hubspot/ui-extensions";
import { calculateHandicap, sortGolfRoundsByDate } from "./utils";
import { GolfRound, HandicapResult } from "./types";
interface HandicapProps {
  golfRounds: GolfRound[];
  firstname: string | null;
}

export const Handicap = ({ golfRounds, firstname }: HandicapProps) => {
  const [handicap, setHandicap] = useState<HandicapResult | null>(null);
  const [recentRound, setRecentRound] = useState<GolfRound | null>(null);

  useEffect(() => {
    setHandicap(calculateHandicap(golfRounds));
    const sortedRounds = sortGolfRoundsByDate(golfRounds);
    if (sortedRounds.length > 0) {
      setRecentRound(sortedRounds[0]);
    }
  }, [golfRounds]);

  const renderPlayerName = () => {
    if (firstname) {
      return `${firstname}${firstname.endsWith('s') ? "'" : "'s"}`;
    }
    return 'Player\'s';
  };

  const renderHandicap = (label: string) => {
    return (
      <Flex direction="row" gap="small">
        {handicap && (<Statistics>
          <StatisticsItem
            label={label}
              number={`${handicap.handicap > 0 ? '-' : '+'}${handicap.handicap.toString()}`}
            />
          </Statistics>
        )}
        {recentRound && (
            <Statistics>
            <StatisticsItem label="Latest round" number={recentRound.properties.score} />
          </Statistics>
        )}
      </Flex>
    );
  }

  const renderHandicapTooltip = (content: string) => {
    return (
      <Tag variant="info" overlay={<Tooltip>{content}</Tooltip>}>
        i
      </Tag>
    )
  }

  const renderStatContent = () => {
    if (!handicap?.official) {
      if (handicap?.initial) {
        return (
          <>
            {renderHandicap(`${renderPlayerName()} Initial Handicap`)}
            <Inline>
              <StatusTag variant="warning">
                A minimum of 20 rounds must be recorded to calculate an official handicap.
              </StatusTag>
              {renderHandicapTooltip('An initial handicap is provided between rounds 5 and 20 to provide a starting point for fair competition.')}
            </Inline>
          </>
        );
      }

      return (
        <>
          {renderHandicap("Handicap Tracking Towards")}
          <Inline>
            <StatusTag variant="warning">
              A minimum of 5 rounds must be recorded to calculate an initial handicap.
            </StatusTag>
            {renderHandicapTooltip('An initial handicap provides a starting point for fair competition.')}
          </Inline>
        </>
      );
    }

    return renderHandicap(`${renderPlayerName()} Official Handicap`)
  }

  return (
    <Flex direction="column" gap="extra-small">
      {renderStatContent()}
    </Flex>
  )
};

