import React, { useState } from "react";
import { Box, Button, Flex, Form, Input, DateInput, NumberInput, Text } from "@hubspot/ui-extensions";

interface GolfRoundFormProps {
  onSubmit: (data: { course: string; score: number; date: string }) => void;
  isSubmitting?: boolean;
}

export const GolfRoundForm = ({ onSubmit, isSubmitting = false }: GolfRoundFormProps) => {
  const [course, setCourse] = useState("");
  const [score, setScore] = useState<number | undefined>(undefined);
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!course || score === undefined || !date) {
      return;
    }

    onSubmit({
      course,
      score,
      date,
    });

    setCourse("");
    setScore(undefined);
    setDate("");
  };

  const isValid = course.trim() !== "" && score !== undefined && score > 0 && date !== "";

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

