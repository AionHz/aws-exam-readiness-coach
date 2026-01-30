export type ProgressState = {
  attemptsTotal: number;
  correctTotal: number;
  byDomain: Record<
    string,
    {
      attempts: number;
      correct: number;
    }
  >;
};
