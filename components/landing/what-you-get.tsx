import { CalendarClock, Gauge, LineChart } from "lucide-react";

const items = [
  {
    icon: CalendarClock,
    title: "Era Verdict",
    teaser: "Your website is from 2017.",
    body: "A shareable read on what year your UI looks like. Designed to be screenshot-worthy on LinkedIn, and uncomfortable enough to fix.",
    color: "bg-hub-yellow",
  },
  {
    icon: Gauge,
    title: "UX Score (0–10)",
    teaser: "Hustle Mode · 6.5/10",
    body: "Scored against the 10-point Hub Solutions Conversion Framework. Trust, Experience, Positioning. Per-question breakdown so you know exactly where you're leaking.",
    color: "bg-hub-orange",
  },
  {
    icon: LineChart,
    title: "90-Day Lead Forecast",
    teaser: "12 → 45 leads / quarter",
    body: "What your current UX predicts vs. what a revamp could deliver. Makes the cost of inaction tangible, in leads, not vague advice.",
    color: "bg-hub-navy",
    invertIcon: true,
  },
];

export function WhatYouGet() {
  return (
    <section className="border-y border-hub-ink/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
            What you walk away with
          </div>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-hub-navy text-balance">
            Three numbers that tell you whether your website is working.
          </h2>
          <p className="mt-4 text-lg text-hub-ink/70 text-pretty">
            Most audit tools spit out a 47-page PDF nobody reads. We give you
            three things, and a clear next move.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, teaser, body, color, invertIcon }) => (
            <article
              key={title}
              className="rounded-3xl border border-hub-ink/10 bg-hub-bg p-6 sm:p-8 flex flex-col"
            >
              <div
                className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    invertIcon ? "text-white" : "text-hub-navy"
                  }`}
                />
              </div>
              <h3 className="mt-5 font-serif text-2xl text-hub-navy">
                {title}
              </h3>
              <div className="mt-2 font-mono text-sm text-hub-orange">
                {teaser}
              </div>
              <p className="mt-4 text-hub-ink/70 text-pretty">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
