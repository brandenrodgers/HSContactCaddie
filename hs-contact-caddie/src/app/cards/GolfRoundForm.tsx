import React, { useState } from "react";
import { Box, Button, Flex, Form, Input, DateInput, NumberInput, Text } from "@hubspot/ui-extensions";
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

  const convertDateToString = (dateValue: DateValue): string => {
    const year = dateValue.year;
    const month = String(dateValue.month).padStart(2, '0');
    const day = String(dateValue.date).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = () => {
    if (!course || score === undefined || !date) {
      return;
    }

    onSubmit({
      course,
      score,
      date: convertDateToString(date),
    });

    setCourse("");
    setScore(undefined);
    setDate(undefined);
  };

  const isValid = course.trim() !== "" && score !== undefined && score > 0 && date !== undefined;

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
        <NumberInput
          label="Score"
          name="score"
          required={true}
          value={score}
          onChange={(value) => setScore(value)}
          placeholder="Enter your score"
          min={1}
        />
        <DateInput
          label="Date Played"
          name="date"
          required={true}
          value={date}
          onChange={(value) => setDate(value)}
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

