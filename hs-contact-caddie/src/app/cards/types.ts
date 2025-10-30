
export interface GolfRoundProperties {
  course: string;
  score: number;
  date: string;
}

export interface GolfRound {
  id: string;
  properties: GolfRoundProperties;
}
