import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Text,
  Tab,
  LineChart,
  Flex,
  Button,
  Box,
  Heading,
  Divider,
  Tag,
  Icon,
  Statistics,
  StatisticsItem,
  ButtonRow,
} from "@hubspot/ui-extensions";
import { CrmActionButton } from '@hubspot/ui-extensions/crm';
import { GolfRound } from "./types";

interface GolfRoundsProps {
  golfRounds: GolfRound[];
  showGolfRounds: boolean;
  golfRoundObjectTypeId: string;
  onDeleteRound: (roundId: string) => Promise<void>;
  isDeletingRound: string | null;
}

export const GolfRounds = ({ golfRounds, showGolfRounds, golfRoundObjectTypeId, onDeleteRound, isDeletingRound }: GolfRoundsProps) => {
  const [selectedHoleType, setSelectedHoleType] = useState<'9' | '18'>('18');

  useEffect(() => {
    const nineHoleCount = golfRounds.filter(round => round.properties.holes === '9').length;
    const eighteenHoleCount = golfRounds.filter(round => round.properties.holes === '18').length;
    setSelectedHoleType(eighteenHoleCount >= nineHoleCount ? '18' : '9');
  }, [golfRounds]);

  const getScoreTrends = () => {
    return golfRounds.slice(0, 20).map(({ properties }) => {
      return {
        Date: properties.date,
        Holes: properties.holes === '9' ? '9 hole rounds' : '18 hole rounds',
        Score: parseInt(properties.score as unknown as string)
      }
    });
  }

  const handleDeleteGolfRound = async (roundId: string) => {
    await onDeleteRound(roundId);
  };

  const getAverageScore = (holes: '9' | '18') => {
    const filteredRounds = golfRounds.filter(round => round.properties.holes === holes);
    if (filteredRounds.length === 0) return null;
    const total = filteredRounds.reduce((sum, round) => sum + parseInt(round.properties.score as unknown as string), 0);
    return (total / filteredRounds.length).toFixed(1);
  };

  const getBestScore = (holes: '9' | '18') => {
    const filteredRounds = golfRounds.filter(round => round.properties.holes === holes);
    if (filteredRounds.length === 0) return null;
    return Math.min(...filteredRounds.map(round => parseInt(round.properties.score as unknown as string)));
  };

  const getWorstScore = (holes: '9' | '18') => {
    const filteredRounds = golfRounds.filter(round => round.properties.holes === holes);
    if (filteredRounds.length === 0) return null;
    return Math.max(...filteredRounds.map(round => parseInt(round.properties.score as unknown as string)));
  };

  const renderRoundsSummary = () => {
    const avgScore = getAverageScore(selectedHoleType);
    const bestScore = getBestScore(selectedHoleType);
    const worstScore = getWorstScore(selectedHoleType);

    const has9HoleRounds = getAverageScore('9') !== null;
    const has18HoleRounds = getAverageScore('18') !== null;

    if (!has9HoleRounds && !has18HoleRounds) {
      return null;
    }

    const showToggle = has9HoleRounds && has18HoleRounds;

    return (
      <Flex direction="column" gap="medium">
        <Flex direction="row" justify="between" align="center">
          <Text format={{ fontWeight: "demibold" }}>
            <Icon name="star" /> {selectedHoleType}-Hole Statistics
          </Text>
          {showToggle && (
            <ButtonRow>
              <Button
                size="extra-small"
                variant={selectedHoleType === '18' ? 'primary' : 'secondary'}
                onClick={() => setSelectedHoleType('18')}
              >
                18 Holes
              </Button>
              <Button
                size="extra-small"
                variant={selectedHoleType === '9' ? 'primary' : 'secondary'}
                onClick={() => setSelectedHoleType('9')}
              >
                9 Holes
              </Button>
            </ButtonRow>
          )}
        </Flex>
        <Flex direction="row" gap="medium" wrap="wrap">
          <Box flex={1}>
            <Statistics>
              <StatisticsItem
                label="Average"
                number={avgScore || '-'}
              />
            </Statistics>
          </Box>
          <Box flex={1}>
            <Statistics>
              <StatisticsItem
                label="Best"
                number={bestScore?.toString() || '-'}
              />
            </Statistics>
          </Box>
          <Box flex={1}>
            <Statistics>
              <StatisticsItem
                label="Worst"
                number={worstScore?.toString() || '-'}
              />
            </Statistics>
          </Box>
        </Flex>
      </Flex>
    );
  };

  const renderGolfRoundsCountLabel = () => {
    return (
      <Flex direction="row" justify="between" align="center">
        <Text format={{ fontWeight: "demibold" }}>
          Showing the last {golfRounds.length > 20 ? 20 : golfRounds.length} round{golfRounds.length > 1 ? 's' : ''}
        </Text>
        <Tag variant="default">{golfRounds.length} total rounds</Tag>
      </Flex>
    )
  }

  const renderGolfRoundsTable = () => {
    return (
      <Flex direction="column" gap="medium">
        {renderRoundsSummary()}
        {renderGolfRoundsCountLabel()}
        <Table bordered={true}>
          <TableHead>
            <TableRow>
              <TableHeader>Course</TableHeader>
              <TableHeader>Score</TableHeader>
              <TableHeader>Holes</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Rating</TableHeader>
              <TableHeader>Slope</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {golfRounds.slice(0, 20).map((round) => (
              <TableRow key={round.id}>
                <TableCell>
                  <Text format={{ fontWeight: "demibold" }}>
                    {round.properties.course}
                  </Text>
                </TableCell>
                <TableCell>
                  <Tag variant={
                    round.properties.holes && getBestScore(round.properties.holes as '9' | '18') === parseInt(round.properties.score as unknown as string)
                      ? "success"
                      : "default"
                  }>
                    {round.properties.score}
                  </Tag>
                </TableCell>
                <TableCell>
                  <Tag variant="default">
                    {round.properties.holes || "N/A"} holes
                  </Tag>
                </TableCell>
                <TableCell>
                  {round.properties.date
                    ? new Date(round.properties.date).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>{round.properties.course_rating || "-"}</TableCell>
                <TableCell>{round.properties.slope || "-"}</TableCell>
                <TableCell>
                  <Flex gap="extra-small">
                    <CrmActionButton
                      actionType="RECORD_APP_LINK"
                      actionContext={{
                        objectTypeId: golfRoundObjectTypeId,
                        objectId: round.id,
                        includeEschref: true,
                      }}
                      size="extra-small"
                      variant="secondary"
                    >
                      <Icon name="view" /> View
                    </CrmActionButton>
                    <Button
                      size="extra-small"
                      variant="destructive"
                      onClick={() => handleDeleteGolfRound(round.id)}
                      disabled={isDeletingRound === round.id}
                    >
                      <Icon name="delete" />
                    </Button>
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Flex>
    )
  }

  const renderGolfRoundsChart = () => {
    return (
      <Flex direction="column" gap="medium">
        {renderRoundsSummary()}
        {renderGolfRoundsCountLabel()}
        <Box>
          <LineChart
            data={getScoreTrends()}
            axes={{
              x: { field: 'Date', fieldType: 'datetime' },
              y: { field: 'Score', fieldType: 'linear' },
              options: {
                groupFieldByColor: 'Holes'
              }
            }}
            options={{
              showLegend: true,
              showDataLabels: true,
              showTooltips: true,
            }}
          />
        </Box>
      </Flex>
    )
  }

  if (!showGolfRounds) {
    return null;
  }

  return (
    <Flex align="stretch" direction="column" gap="medium">
      <Flex direction="row" justify="between" align="center">
        <Heading>Golf Round History</Heading>
      </Flex>
      <Tabs defaultSelected="golf-rounds-table">
        <Tab tabId="golf-rounds-table" title="Rounds Played">
          {renderGolfRoundsTable()}
        </Tab>
        <Tab tabId="golf-rounds-chart" title="Score Trends">
          {renderGolfRoundsChart()}
        </Tab>
      </Tabs>
    </Flex>
  )
};
