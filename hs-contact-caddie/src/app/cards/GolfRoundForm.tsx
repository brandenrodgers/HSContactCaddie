import React, { useState } from "react";
import { Box, Flex, Form, Input, DateInput, NumberInput, Select, LoadingButton } from "@hubspot/ui-extensions";
import { GolfRoundProperties } from "./types";

interface GolfRoundFormProps {
  onSubmit: (data: GolfRoundProperties) => void;
  isSubmitting?: boolean;
  firstname: string | null;
}

interface DateValue {
  year: number;
  month: number;
  date: number;
}

export const GolfRoundForm = ({ onSubmit, isSubmitting = false, firstname }: GolfRoundFormProps) => {
  const [course, setCourse] = useState("");
  const [score, setScore] = useState<number | undefined>(undefined);
  const [date, setDate] = useState<DateValue | undefined>(undefined);
  const [holes, setHoles] = useState<"9" | "18">("18");
  const [slope, setSlope] = useState<number | undefined>(undefined);
  const [courseRating, setCourseRating] = useState<number | undefined>(undefined);

  const convertDateToString = (dateValue: DateValue): string => {
    const year = dateValue.year;
    const month = String(dateValue.month).padStart(2, '0');
    const day = String(dateValue.date).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = () => {
    if (!course || score === undefined || !date || !holes) {
      return;
    }

    onSubmit({
      course,
      score,
      date: convertDateToString(date),
      holes,
      slope,
      course_rating: courseRating,
    });

    setCourse("");
    setScore(undefined);
    setDate(undefined);
    setHoles("18");
    setSlope(undefined);
    setCourseRating(undefined);
  };

  const isValid = course.trim() !== "" && score !== undefined && score > 0 && date !== undefined && holes !== undefined;

  return (
    <Flex direction="column" align="center">
      <Form>
        <Flex direction="column" gap="small">
          <Input
            label="Course Name"
            name="course"
            required={true}
            value={course}
            onChange={(value) => setCourse(value)}
            placeholder="Enter golf course name"
          />
          <Flex direction="row" gap="small">
            <Box flex={1}>
              <NumberInput
                label="Score"
                name="score"
                required={true}
                value={score}
                onChange={(value) => setScore(value)}
                placeholder={`Enter ${firstname}${firstname?.endsWith('s') ? "'" : "'s"} score`}
                min={1}
              />
            </Box>
            <Box flex={1}>
              <DateInput
                label="Date Played"
                name="date"
                required={true}
                value={date}
                onChange={(value) => setDate(value)}
              />
            </Box>
          </Flex>
          <Flex direction="row" gap="small">
            <Box flex={1}>
              <Select
                label="Holes"
                name="holes"
                required={true}
                value={holes}
                onChange={(value) => setHoles(value as "9" | "18")}
                options={[
                  { label: "9 Holes", value: "9" },
                  { label: "18 Holes", value: "18" }
                ]}
              />
            </Box>
            <Box flex={1}>
              <NumberInput
                label="Course Rating"
                name="course_rating"
                value={courseRating}
                onChange={(value) => setCourseRating(value)}
                placeholder="Optional"
                tooltip="The course rating is used to calculate the handicap differential. It is the expected score for a scratch golfer on the course."
                min={60}
                max={80}
              />
            </Box>
          </Flex>
          <NumberInput
            label="Slope Rating"
            name="slope"
            value={slope}
            onChange={(value) => setSlope(value)}
            placeholder="Optional"
            tooltip="The course slope rating is used to calculate the handicap differential. It measures how much more difficult the course is for a bogey golfer compared to a scratch golfer."
            min={55}
            max={155}
          />
          <Box alignSelf="center">
            <LoadingButton
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Recording..." : "Record Round"}
            </LoadingButton>
          </Box>
        </Flex>
      </Form>
    </Flex>
  );
};

