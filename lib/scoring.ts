import type {
  ForecastRange,
  QuestionResult,
  ScoreBracket,
} from "./types";

const POINTS: Record<QuestionResult["score"], number> = {
  YES: 1,
  MAYBE: 0.5,
  NO: 0,
};

export function computeScore(questions: QuestionResult[]): number {
  const total = questions
    .slice(0, 10)
    .reduce((acc, q) => acc + POINTS[q.score], 0);
  return Math.round(total * 10) / 10;
}

export type BracketMeta = {
  bracket: ScoreBracket;
  label: string;
  verdict: string;
  forecast: ForecastRange;
};

export function bracketFor(score: number): BracketMeta {
  if (score < 3) {
    return {
      bracket: "Risk",
      label: "Risk Mode",
      verdict: "No clear direction. Urgent clarity needed.",
      forecast: {
        current: { low: 0, high: 4 },
        potential: { low: 30, high: 60 },
      },
    };
  }
  if (score < 5) {
    return {
      bracket: "Struggle",
      label: "Struggle Mode",
      verdict: "Built, but not converting. Enquiries are inconsistent.",
      forecast: {
        current: { low: 4, high: 12 },
        potential: { low: 30, high: 60 },
      },
    };
  }
  if (score < 8) {
    return {
      bracket: "Hustle",
      label: "Hustle Mode",
      verdict: "Results come from effort, not from the website.",
      forecast: {
        current: { low: 12, high: 30 },
        potential: { low: 45, high: 75 },
      },
    };
  }
  return {
    bracket: "Scale",
    label: "Scale Mode",
    verdict: "Clear. Credible. Converting.",
    forecast: {
      current: { low: 30, high: 80 },
      potential: { low: 60, high: 100 },
    },
  };
}
