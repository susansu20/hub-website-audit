import Anthropic from "@anthropic-ai/sdk";
import { fetchPageSpeed } from "./pagespeed";
import { fetchHtmlSignals } from "./html-fetch";
import { captureScreenshot } from "./screenshot";
import { bracketFor, computeScore } from "./scoring";
import { getCachedAnalysis, hashUrl, setCachedAnalysis } from "./cache";
import { SCHEMA_VERSION, type AnalysisResult, type QuestionLayer, type QuestionResult, type QuestionScore } from "./types";

const FRAMEWORK_QUESTIONS: { id: number; layer: QuestionLayer; question: string }[] = [
  { id: 1, layer: "Trust", question: "Above-the-fold has hero, one-line value statement, AND social proof." },
  { id: 2, layer: "Trust", question: "Real, specific social proof is visible (case studies, results, testimonials with specifics), not buried or generic." },
  { id: 3, layer: "Trust", question: "Brand is visually consistent across pages, not built in 3 different eras." },
  { id: 4, layer: "Experience", question: "Top 3 internal pages are discoverable from the homepage in one click via clear nav." },
  { id: 5, layer: "Experience", question: "Mobile PageSpeed Insights performance score is 80 or above." },
  { id: 6, layer: "Experience", question: "Specific action button above the fold (NOT 'Learn More' or 'Contact Us') AND repeated further down." },
  { id: 7, layer: "Positioning", question: "Every key page guides the visitor toward one clear next step (not a buffet)." },
  { id: 8, layer: "Positioning", question: "Within seconds, visitor can tell exactly who you serve and what result you deliver." },
  { id: 9, layer: "Positioning", question: "Site actively filters in ideal clients and filters out wrong-fit ones (pricing, niche language, qualification cues)." },
  { id: 10, layer: "Positioning", question: "Site works as a silent salesperson with FAQs, objection handling, process, and outcomes." },
];

type ClaudeJsonResponse = {
  era: {
    verdict: string;
    year: number;
    reasoning: string;
  };
  questions: {
    id: number;
    score: QuestionScore;
    rationale: string;
  }[];
};

function buildPrompt(opts: {
  url: string;
  host: string;
  pagespeedScore: number | null;
  signals: Awaited<ReturnType<typeof fetchHtmlSignals>>;
}): string {
  const { url, host, pagespeedScore, signals } = opts;

  return `You are auditing a small business website against the Hub Solutions Conversion-Optimized Website Framework.

URL: ${url}
Host: ${host}
Mobile PageSpeed Insights performance score: ${pagespeedScore ?? "unknown"}

HTML signals collected from the homepage:
- Title: ${signals.title ?? "(none)"}
- Description: ${signals.description ?? "(none)"}
- Generator meta: ${signals.generator ?? "(none)"}
- Viewport meta: ${signals.viewport ?? "(MISSING, strong pre-2010 signal)"}
- Has Flash embed: ${signals.hasFlash}
- Has frameset: ${signals.hasFrameset}
- jQuery present: ${signals.hasJquery}
- Tailwind-like utility classes: ${signals.hasTailwind}
- Google Fonts loaded: ${signals.hasGoogleFonts}
- Dark mode media query: ${signals.hasDarkModeMedia}
- Number of <a> tags: ${signals.navLinkCount}
- Number of <img> tags: ${signals.imgCount}
- Font families seen: ${signals.fontFaceFamilies.join(", ") || "(none detected)"}
- Top-level nav links: ${signals.topLevelLinks.join(" | ") || "(none detected)"}

HTML excerpt (first 6000 chars):
"""
${signals.rawExcerpt}
"""

You will receive TWO screenshots:
1) Desktop full-page screenshot at 1440x900
2) Mobile full-page screenshot at 390x844

Your task: return a strict JSON object with TWO things and NOTHING else:

1) "era": the design era this website looks like. Use one of these year buckets and the matching verdict template:
   - 1995–2002: "Your website is from {year}. Geocities called."
   - 2003–2008: "Your website is from {year}. The Web 2.0 bubble called."
   - 2009–2014: "Your website is from {year}. The skeuomorphism era."
   - 2015–2019: "Your website is from {year}. Flat design era."
   - 2020–2023: "Your website is from {year}. Pandemic-era polish."
   - 2024–2026: "Your website is current. Now let's make it convert."
   The "year" field is the SPECIFIC year (e.g. 2017) that best matches.
   "reasoning" is two short sentences describing the visual markers you saw.

2) "questions": an array of EXACTLY 10 entries, one per framework question below, each with:
   - "id": the question id (1-10)
   - "score": "YES" | "MAYBE" | "NO"
   - "rationale": ONE short sentence explaining your call. Avoid hedging. Be specific.

Framework questions:
${FRAMEWORK_QUESTIONS.map((q) => `${q.id}. [${q.layer}] ${q.question}`).join("\n")}

Scoring rules:
- Question 5 is determined entirely by the PageSpeed score above: YES if >= 80, MAYBE if 50–79, NO if <50 or unknown.
- For every other question, judge from the screenshots + HTML signals. If something is partially present, MAYBE. If clearly absent, NO. If clearly present and specific, YES.

Voice rules for "rationale":
- No em dashes ("—") anywhere.
- No "setup-and-reveal" or "rule of three" patterns.
- Plain, confident, direct. Like a UX consultant on a sales call.

Output rules:
- Strict JSON only. No prose before or after. No code fences. No markdown.
- Keys must be exactly: era, questions.
- Each question entry must have exactly: id, score, rationale.`;
}

function safeParseJson(raw: string): ClaudeJsonResponse {
  const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(trimmed) as ClaudeJsonResponse;
}

function overridePageSpeedScore(
  questions: ClaudeJsonResponse["questions"],
  pagespeedScore: number | null
): ClaudeJsonResponse["questions"] {
  return questions.map((q) => {
    if (q.id !== 5) return q;
    if (pagespeedScore == null) {
      return { id: 5, score: "NO", rationale: "Could not measure PageSpeed mobile performance." };
    }
    if (pagespeedScore >= 80) {
      return { id: 5, score: "YES", rationale: `Mobile PageSpeed is ${pagespeedScore}/100, above the 80 threshold.` };
    }
    if (pagespeedScore >= 50) {
      return { id: 5, score: "MAYBE", rationale: `Mobile PageSpeed is ${pagespeedScore}/100, below the 80 threshold.` };
    }
    return { id: 5, score: "NO", rationale: `Mobile PageSpeed is only ${pagespeedScore}/100, far below the 80 threshold.` };
  });
}

let anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (anthropic) return anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  anthropic = new Anthropic({ apiKey });
  return anthropic;
}

export async function runAnalysis(rawUrl: string): Promise<AnalysisResult> {
  const url = new URL(rawUrl).toString();
  const host = new URL(url).hostname.replace(/^www\./, "");
  const hash = hashUrl(url);

  const cached = await getCachedAnalysis(hash).catch(() => null);
  if (cached) return cached;

  const [desktopShot, mobileShot, signals, pagespeed] = await Promise.all([
    captureScreenshot(url, "desktop"),
    captureScreenshot(url, "mobile"),
    fetchHtmlSignals(url),
    fetchPageSpeed(url).catch(() => ({
      performance: null,
      lcpMs: null,
      clsValue: null,
      fidMs: null,
      hasViewportMeta: null,
    })),
  ]);

  const prompt = buildPrompt({
    url,
    host,
    pagespeedScore: pagespeed.performance,
    signals,
  });

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2500,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: desktopShot } },
          { type: "image", source: { type: "base64", media_type: "image/png", data: mobileShot } },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Claude returned no text block");
  }
  const parsed = safeParseJson(block.text);

  const adjustedQuestions = overridePageSpeedScore(parsed.questions, pagespeed.performance);
  if (adjustedQuestions.length !== 10) {
    throw new Error(`Claude returned ${adjustedQuestions.length} questions, expected 10`);
  }

  const questionResults: QuestionResult[] = FRAMEWORK_QUESTIONS.map((meta) => {
    const match = adjustedQuestions.find((q) => q.id === meta.id);
    if (!match) {
      return {
        id: meta.id,
        layer: meta.layer,
        question: meta.question,
        score: "NO",
        rationale: "No response from analyzer.",
      };
    }
    return {
      id: meta.id,
      layer: meta.layer,
      question: meta.question,
      score: match.score,
      rationale: match.rationale,
    };
  });

  const score = computeScore(questionResults);
  const meta = bracketFor(score);

  const result: AnalysisResult = {
    hash,
    url,
    host,
    era: parsed.era,
    score,
    bracket: meta.bracket,
    bracketLabel: meta.label,
    bracketVerdict: meta.verdict,
    forecast: meta.forecast,
    questions: questionResults,
    pagespeedScore: pagespeed.performance,
    createdAt: new Date().toISOString(),
    version: SCHEMA_VERSION,
  };

  await setCachedAnalysis(result).catch((err) => {
    console.warn("[analysis] cache write failed:", err);
  });

  return result;
}
