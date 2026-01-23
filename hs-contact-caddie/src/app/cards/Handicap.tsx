import React, { useState, useEffect } from "react";
import { Flex, Statistics, StatisticsItem, Tag, Box, Text, Icon, ProgressBar, Heading, Divider } from "@hubspot/ui-extensions";
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

  const getTotalRoundsCount = () => golfRounds.length;

  const getProgressTowardsOfficial = () => {
    const count = getTotalRoundsCount();
    if (count >= 20) return 100;
    if (count >= 5) return (count / 20) * 100;
    return (count / 5) * 100;
  };

  const getProgressLabel = () => {
    const count = getTotalRoundsCount();
    if (count >= 20) return "Official Handicap Achieved!";
    if (count >= 5) return `${20 - count} more rounds to official handicap`;
    return `${5 - count} more rounds to initial handicap`;
  };

  const getHandicapBadge = () => {
    const count = getTotalRoundsCount();
    if (count >= 20) {
      return <Tag variant="success">Official Handicap</Tag>;
    }
    if (count >= 5) {
      return <Tag variant="warning">Initial Handicap</Tag>;
    }
    return <Tag variant="default">No Handicap Yet</Tag>;
  };

  const renderHandicapHeader = () => {
    return (
      <Flex direction="row" justify="between" align="center">
        <Heading>Golf tracker for {firstname}</Heading>
        {getHandicapBadge()}
      </Flex>
    );
  };

  const renderMainStats = () => {
    return (
      <Flex direction="row" gap="medium" wrap="wrap">
        {handicap && (
          <Box flex={1}>
            <Statistics>
              <StatisticsItem
                label={`${renderPlayerName()} Handicap`}
                number={`${handicap.handicap > 0 ? '' : '+'}${Math.abs(handicap.handicap).toFixed(1)}`}
              />
            </Statistics>
          </Box>
        )}
        {recentRound && (
          <Box flex={1}>
            <Statistics>
              <StatisticsItem
                label="Latest Round"
                number={recentRound.properties.score}
              />
            </Statistics>
          </Box>
        )}
        <Box flex={1}>
          <Statistics>
            <StatisticsItem
              label="Total Rounds"
              number={getTotalRoundsCount().toString()}
            />
          </Statistics>
        </Box>
      </Flex>
    );
  };

  const renderProgressSection = () => {
    const progress = getProgressTowardsOfficial();
    const count = getTotalRoundsCount();

    const getProgressDescription = () => {
      if (count >= 20) {
        return "Official handicap achieved";
      }
      if (count >= 5) {
        return "Progress to official handicap";
      }
      return "Progress to initial handicap";
    };

    return (
      <Flex direction="column" gap="extra-small">
        <Flex direction="row" justify="between" align="center">
          <Text format={{ fontWeight: "demibold" }}>
            <Icon name={count >= 20 ? "success" : "star"} /> {getProgressDescription()}
          </Text>
          <Text format={{ fontWeight: "demibold" }}>
            {count}&nbsp;/&nbsp;{count >= 5 ? "20" : "5"}
          </Text>
        </Flex>
        <ProgressBar
          value={progress}
          variant={count >= 20 ? "success" : count >= 5 ? "warning" : "danger"}
          title={getProgressLabel()}
        />
      </Flex>
    );
  };


  return (
    <Flex direction="column" gap="medium">
      {renderHandicapHeader()}
      <Divider />
      {renderMainStats()}
      {getTotalRoundsCount() < 20 && renderProgressSection()}
    </Flex>
  )
};

