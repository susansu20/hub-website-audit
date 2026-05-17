import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How the audit works",
  description:
    "The framework, signals, and scoring behind every Hub Solutions website audit.",
};

const trustQs = [
  "Above-the-fold has hero, one-line value statement, AND social proof.",
  "Real, specific social proof is visible (case studies, results, testimonials with specifics), not buried or generic.",
  "Brand is visually consistent across pages.",
];

const experienceQs = [
  "Top 3 internal pages are discoverable from the homepage in one click.",
  "Mobile PageSpeed Insights performance score is 80 or above.",
  "Specific action button above the fold AND repeated further down.",
];

const positioningQs = [
  "Every key page guides the visitor toward one clear next step.",
  "Within seconds, visitor can tell who you serve and what result you deliver.",
  "Site actively filters in ideal clients and filters out wrong-fit ones.",
  "Site works as a silent salesperson (FAQs, objections, process, outcomes).",
];

export default function MethodologyPage() {
  return (
    <div className="bg-hub-bg">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="text-sm text-hub-ink/60 hover:text-hub-navy"
        >
          ← Back to the audit
        </Link>

        <h1 className="mt-6 font-serif text-5xl sm:text-6xl text-hub-navy text-balance">
          How the audit works.
        </h1>
        <p className="mt-5 text-lg text-hub-ink/70 text-pretty">
          Every audit runs the same six-step pipeline on your homepage, then
          scores it against a ten-point framework Susan uses with paying
          clients.
        </p>

        <section className="mt-12">
          <h2 className="font-serif text-3xl text-hub-navy">The pipeline</h2>
          <ol className="mt-6 space-y-5 text-hub-ink/80">
            <Step n={1} title="URL is validated">
              We reject private IPs, localhost, and non-HTML responses before
              spending anything on analysis.
            </Step>
            <Step n={2} title="Cache check">
              Hashed URLs are cached for 24 hours so repeat checks are instant
              and free.
            </Step>
            <Step n={3} title="Full-page capture">
              Desktop (1440×900) and mobile (390×844) full-page screenshots via
              ScreenshotOne.
            </Step>
            <Step n={4} title="Performance probe">
              Google PageSpeed Insights for the real mobile performance score
              and Core Web Vitals.
            </Step>
            <Step n={5} title="HTML signals">
              We extract title, meta, viewport, fonts, generator hints, jQuery
              presence, and nav structure to spot era markers HTML side.
            </Step>
            <Step n={6} title="Vision analysis">
              Claude Sonnet 4 with vision compares both screenshots, all
              signals, and the PageSpeed score against the framework and
              returns the scored verdict.
            </Step>
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-hub-navy">
            The 10-point framework
          </h2>
          <p className="mt-3 text-hub-ink/70 text-pretty">
            Split across three layers. YES = 1 point. MAYBE = 0.5. NO = 0. Max
            10.
          </p>

          <Layer name="Trust" color="bg-hub-yellow" textColor="text-hub-navy" questions={trustQs} />
          <Layer name="Experience" color="bg-hub-orange" textColor="text-white" questions={experienceQs} />
          <Layer name="Positioning" color="bg-hub-navy" textColor="text-white" questions={positioningQs} />
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-hub-navy">Score brackets</h2>
          <div className="mt-6 space-y-3 text-hub-ink/80">
            <Bracket label="Under 3 · Risk Mode" body="No clear direction. Urgent clarity needed." />
            <Bracket label="3 – 5 · Struggle Mode" body="Built, but not converting. Inconsistent enquiries." />
            <Bracket label="5 – 8 · Hustle Mode" body="Results come from effort, not from the website." />
            <Bracket label="8 – 10 · Scale Mode" body="Clear. Credible. Converting." />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-hub-navy">
            Where the lead forecast comes from
          </h2>
          <p className="mt-3 text-hub-ink/70 text-pretty">
            Score brackets map to lead-range estimates calibrated on anonymized
            data from 50+ Singapore SME websites Susan has worked on. The
            forecast is directional, not predictive. Real numbers depend on
            traffic, industry, and offer.
          </p>
        </section>

        <section className="mt-16 rounded-3xl bg-hub-navy text-white p-8 sm:p-12 text-center">
          <h2 className="font-serif text-3xl text-balance">
            Run yours in 60 seconds.
          </h2>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-full bg-hub-orange px-7 py-4 text-base font-semibold text-hub-navy hover:bg-hub-yellow transition-colors"
          >
            Audit my site
          </Link>
        </section>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="shrink-0 h-9 w-9 rounded-full bg-white border border-hub-ink/10 flex items-center justify-center font-serif text-hub-orange">
        {n}
      </span>
      <div>
        <div className="font-medium text-hub-navy">{title}</div>
        <div className="mt-1 text-hub-ink/70">{children}</div>
      </div>
    </li>
  );
}

function Layer({
  name,
  color,
  textColor,
  questions,
}: {
  name: string;
  color: string;
  textColor: string;
  questions: string[];
}) {
  return (
    <div className="mt-6">
      <div className={`inline-flex items-center rounded-full ${color} ${textColor} px-3 py-1 text-xs font-semibold uppercase tracking-widest`}>
        {name}
      </div>
      <ul className="mt-3 space-y-2 text-hub-ink/80 list-disc pl-5">
        {questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </div>
  );
}

function Bracket({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white border border-hub-ink/10 p-5">
      <div className="font-serif text-xl text-hub-navy">{label}</div>
      <div className="mt-1 text-sm text-hub-ink/70">{body}</div>
    </div>
  );
}
