
export interface GolfRoundProperties {
  course: string;
  score: number;
  date: string;
  holes: "9" | "18";
  slope?: number;
  course_rating?: number;
}

export interface GolfRound {
  id: string;
  properties: GolfRoundProperties;
}
