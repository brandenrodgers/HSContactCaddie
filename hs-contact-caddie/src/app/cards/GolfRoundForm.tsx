import React, { useState } from "react";
import { Box, Button, Flex, Form, Input, DateInput, NumberInput, Select } from "@hubspot/ui-extensions";
import { GolfRoundProperties } from "./types";

interface GolfRoundFormProps {
  onSubmit: (data: GolfRoundProperties) => void;
  isSubmitting?: boolean;
}

interface DateValue {
  year: number;
  month: number;
  date: number;
}

export const GolfRoundForm = ({ onSubmit, isSubmitting = false }: GolfRoundFormProps) => {
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
              placeholder="Enter your score"
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
          min={55}
          max={155}
        />
        <Box>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Recording..." : "Record Round"}
          </Button>
        </Box>
      </Flex>
    </Form>
  );
};

