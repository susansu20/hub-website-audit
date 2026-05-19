import Link from "next/link";
import { ArrowRight, Check, CircleHelp, Mail, PartyPopper, X } from "lucide-react";
import type { AnalysisResult, QuestionResult } from "@/lib/types";
import { ShareButtons } from "./share-buttons";
import { EraReveal } from "./era-reveal";

export function ResultsView({ result }: { result: AnalysisResult }) {
  const bookingUrl = process.env.HUB_SOLUTIONS_BOOKING_URL || "#";

  return (
    <div className="bg-hub-bg">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <CelebrationHeader result={result} />

        <EraCard result={result} />
        <ScoreCard result={result} />
        <ForecastCard result={result} />
        <BreakdownCard questions={result.questions} />
        <FinalCta bookingUrl={bookingUrl} />

        <p className="text-center text-xs text-hub-ink/40 italic max-w-2xl mx-auto">
          Forecast based on Hub Solutions&rsquo; anonymized client data across
          50+ Singapore SME websites. Actual results depend on traffic, industry,
          and offer.
        </p>
      </div>
    </div>
  );
}

function CelebrationHeader({ result }: { result: AnalysisResult }) {
  const scoreLabel = `${result.score.toFixed(1)}/10 (${result.bracketLabel})`;
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-hub-yellow text-hub-navy px-4 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm">
        <PartyPopper className="h-3.5 w-3.5" />
        Your result is out
      </div>
      <h1 className="mt-5 font-serif text-5xl sm:text-6xl text-hub-navy text-balance">
        Here&rsquo;s the verdict for {result.host}.
      </h1>
      <p className="mt-3 inline-flex items-center gap-2 text-sm text-hub-ink/60">
        <Mail className="h-4 w-4" />
        We&rsquo;ve sent a copy of this audit to your inbox.
      </p>
      <div className="mt-6">
        <ShareButtons
          host={result.host}
          era={result.era.verdict}
          scoreLabel={scoreLabel}
        />
      </div>
    </header>
  );
}

function EraCard({ result }: { result: AnalysisResult }) {
  return (
    <section className="rounded-3xl bg-hub-navy text-white p-8 sm:p-14 text-center shadow-[0_30px_80px_-30px_rgba(27,42,94,0.45)]">
      <div className="text-xs uppercase tracking-widest text-white/60">
        Era verdict
      </div>
      <div className="mt-5">
        <EraReveal year={result.era.year} />
      </div>
      <div className="mt-6 font-serif text-2xl sm:text-3xl text-hub-yellow">
        {result.era.verdict}
      </div>
      <p className="mt-4 max-w-2xl mx-auto text-white/80 text-pretty">
        {result.era.reasoning}
      </p>
    </section>
  );
}

function ScoreCard({ result }: { result: AnalysisResult }) {
  return (
    <section className="rounded-3xl bg-white border border-hub-ink/10 p-8 sm:p-14 text-center">
      <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
        UX score
      </div>
      <div className="mt-3 font-serif text-hub-navy inline-flex items-end justify-center gap-3 leading-none">
        <span className="text-score">{result.score.toFixed(1)}</span>
        <span className="text-2xl text-hub-ink/30 pb-3 sm:pb-4 md:pb-6">/10</span>
      </div>
      <div className="mt-2 inline-flex items-center rounded-full bg-hub-yellow px-4 py-1.5 text-sm font-semibold text-hub-navy">
        {result.bracketLabel}
      </div>
      <p className="mt-4 max-w-xl mx-auto text-hub-ink/70 text-pretty">
        {result.bracketVerdict}
      </p>
    </section>
  );
}

function ForecastCard({ result }: { result: AnalysisResult }) {
  const { current, potential } = result.forecast;
  const currentLabel = `${current.low} – ${current.high}`;
  const potentialLabel =
    potential.high >= 100
      ? `${potential.low}+`
      : `${potential.low} – ${potential.high}`;

  return (
    <section className="rounded-3xl bg-white border border-hub-ink/10 p-8 sm:p-12">
      <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold text-center">
        90-day lead forecast
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-hub-bg p-6 text-center">
          <div className="text-sm text-hub-ink/60">Current trajectory</div>
          <div className="mt-2 font-serif text-5xl text-hub-navy">
            {currentLabel}
          </div>
          <div className="mt-1 text-sm text-hub-ink/60">leads / 90 days</div>
        </div>
        <div className="rounded-2xl bg-hub-navy text-white p-6 text-center">
          <div className="text-sm text-white/60">After UX revamp</div>
          <div className="mt-2 font-serif text-5xl text-hub-yellow">
            {potentialLabel}
          </div>
          <div className="mt-1 text-sm text-white/70">leads / 90 days</div>
        </div>
      </div>

      <div className="mt-6 text-center font-serif text-xl text-hub-navy text-balance">
        That&rsquo;s the cost of leaving things as they are.
      </div>
    </section>
  );
}

function BreakdownCard({ questions }: { questions: QuestionResult[] }) {
  return (
    <section className="rounded-3xl bg-white border border-hub-ink/10 p-6 sm:p-10">
      <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
        The 10-point breakdown
      </div>
      <h2 className="mt-2 font-serif text-3xl text-hub-navy">
        Where you&rsquo;re winning and where you&rsquo;re leaking.
      </h2>

      <ol className="mt-8 space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="rounded-2xl border border-hub-ink/10 bg-hub-bg/40 p-4 sm:p-5 flex gap-4"
          >
            <ScoreBadge score={q.score} />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-hub-ink/50">
                {q.layer}
              </div>
              <div className="mt-0.5 font-medium text-hub-navy">{q.question}</div>
              <div className="mt-1 text-sm text-hub-ink/70 text-pretty">
                {q.rationale}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScoreBadge({ score }: { score: "YES" | "MAYBE" | "NO" }) {
  if (score === "YES") {
    return (
      <span className="h-9 w-9 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
        <Check className="h-5 w-5" />
      </span>
    );
  }
  if (score === "NO") {
    return (
      <span className="h-9 w-9 shrink-0 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <X className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className="h-9 w-9 shrink-0 rounded-full bg-hub-yellow/40 text-hub-navy flex items-center justify-center">
      <CircleHelp className="h-5 w-5" />
    </span>
  );
}

function FinalCta({ bookingUrl }: { bookingUrl: string }) {
  return (
    <section className="rounded-3xl bg-hub-navy text-white p-8 sm:p-12 text-center">
      <h2 className="font-serif text-3xl sm:text-4xl text-balance">
        Want Susan to fix this for you?
      </h2>
      <p className="mt-3 text-white/70 text-pretty max-w-xl mx-auto">
        Book a free 15-minute strategy call. We&rsquo;ll walk through your top
        three highest-ROI fixes, no obligation.
      </p>
      <Link
        href={bookingUrl}
        target={bookingUrl.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-hub-orange px-7 py-4 text-base font-semibold text-hub-navy hover:bg-hub-yellow transition-colors"
      >
        Book my strategy call
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
