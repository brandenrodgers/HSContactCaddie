import React from "react";
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
} from "@hubspot/ui-extensions";
import { CrmActionButton } from '@hubspot/ui-extensions/crm';
import { GolfRound } from "./types";


export const GolfRounds = ({ golfRounds, showGolfRounds, golfRoundObjectTypeId }: { golfRounds: GolfRound[], showGolfRounds: boolean, golfRoundObjectTypeId: string }) => {

  const getScoreTrends = () => {
    return golfRounds.slice(0, 20).map(({ properties }) => {
      return {
        Date: properties.date,
        Holes: properties.holes === '9' ?  '9 hole rounds' : '18 hole rounds',
        Score: parseInt(properties.score as unknown as string)
      }
    });
  }

  const renderGolfRoundsCountLabel = () => {
    return (
      <Text>Showing the last {golfRounds.length > 20 ? 20 : golfRounds.length} round{golfRounds.length > 1 ? 's' : ''} played</Text>
    )
  }

  const renderGolfRoundsTable = () => {
    return (
      <>
        <Table bordered={true}>
          <TableHead>
            <TableRow>
              <TableHeader>Course</TableHeader>
              <TableHeader>Score</TableHeader>
              <TableHeader>Holes</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Rating</TableHeader>
              <TableHeader>Slope</TableHeader>
              <TableHeader>Record link</TableHeader>
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
                <TableCell>
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
                  View round
                </CrmActionButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderGolfRoundsCountLabel()}
      </>
    )
  }

  const renderGolfRoundsChart = () => {
    return (
      <>
        <LineChart
          data={getScoreTrends()}
          axes={{
            x: { field: 'Date', fieldType: 'datetime' },
            y: { field: 'Score', fieldType: 'linear' },
            options:{
              groupFieldByColor: 'Holes'
            }
          }}
          options={{
            showLegend: true,
            showDataLabels: true,
            showTooltips: true,
          }}
        />
        {renderGolfRoundsCountLabel()}
      </>
    )
  }

  if (!showGolfRounds) {
    return null;
  }

  return (
    <Flex align="stretch" direction="column" gap="small">
      <Tabs defaultSelected="golf-rounds-table">
        <Tab tabId="golf-rounds-table" title="Rounds played">
          {renderGolfRoundsTable()}
        </Tab>
        <Tab tabId="golf-rounds-chart" title="Score trends">
          {renderGolfRoundsChart()}
        </Tab>
      </Tabs>
    </Flex>
  )
};
