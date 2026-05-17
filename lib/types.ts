export type QuestionScore = "YES" | "MAYBE" | "NO";

export type QuestionLayer = "Trust" | "Experience" | "Positioning";

export type QuestionResult = {
  id: number;
  layer: QuestionLayer;
  question: string;
  score: QuestionScore;
  rationale: string;
};

export type EraVerdict = {
  verdict: string;
  year: number;
  reasoning: string;
};

export type ScoreBracket = "Risk" | "Struggle" | "Hustle" | "Scale";

export type ForecastRange = {
  /** Lower bound for the score bracket */
  current: { low: number; high: number };
  /** Range achievable after a Hub Solutions revamp */
  potential: { low: number; high: number };
};

export type AnalysisResult = {
  hash: string;
  url: string;
  host: string;
  era: EraVerdict;
  score: number;
  bracket: ScoreBracket;
  bracketLabel: string;
  bracketVerdict: string;
  forecast: ForecastRange;
  questions: QuestionResult[];
  pagespeedScore: number | null;
  createdAt: string;
  /** Schema version, for cache invalidation if we change the shape */
  version: number;
};

export const SCHEMA_VERSION = 1;
