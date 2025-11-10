import { GolfRound, HandicapResult } from "./types";

const DEFAULT_SLOPE = 113; // This is the average slope rating for a golf course
const DEFAULT_COURSE_RATING = 72; // This is the average course rating for a golf course
const HANDICAP_DIFFERENTIAL_FACTOR = 0.96; // This is the factor used to calculate the handicap differential

export const calculateHandicapDifferential = (golfRound: GolfRound): number => {
  const { score, holes, slope, course_rating } = golfRound.properties;

  const full18HoleScore = holes === "9" ? score * 2 : score;
  const courseSlope = slope || DEFAULT_SLOPE;
  const courseRating = course_rating || DEFAULT_COURSE_RATING;

  return (full18HoleScore - courseRating) * (DEFAULT_SLOPE / courseSlope);
}

export const sortGolfRoundsByDate = (golfRounds: GolfRound[]): GolfRound[] => {
  return golfRounds.sort((a, b) => new Date(b.properties.date).getTime() - new Date(a.properties.date).getTime());
}

export const calculateHandicap = (golfRounds: GolfRound[]): HandicapResult => {
  const result = { official: false, initial: false, handicap: 0 };

  // If the contact has not played at least 20 rounds, the handicap isn't official
  // If the contact has played less than 20 rounds but at least 5 rounds, the handicap is an initial handicap
  if (golfRounds.length >= 20) {
    result.official = true;
  } else if (golfRounds.length >= 5) {
    result.initial = true;
  }

  // Handicap only considers the last 20 rounds played
  const last20Rounds = sortGolfRoundsByDate(golfRounds).slice(0, 20);

  // Calculate the handicap differential for each round
  const handicapDifferentials = last20Rounds.map(calculateHandicapDifferential);

  // Take the best 8 handicap differentials from the last 20 rounds
  const best8HandicapDifferentials = handicapDifferentials.sort((a, b) => a - b).slice(0, 8);

  // Calculate the average of the best 8 handicap differentials
  const handicapIndex = best8HandicapDifferentials.reduce((sum, differential) => sum + differential, 0) / best8HandicapDifferentials.length;

  // Calculate the official handicap index by multiplying the average handicap differential by the handicap differential factor and rounding to the nearest tenth
  result.handicap = Math.round(handicapIndex * HANDICAP_DIFFERENTIAL_FACTOR * 10) / 10;

  return result;
}
