"use client";

import { useEffect, useRef, useState } from "react";

const STAGES = [
  { until: 18, label: "Capturing your homepage" },
  { until: 38, label: "Reading the design era" },
  { until: 62, label: "Scoring against the framework" },
  { until: 85, label: "Calculating your lead forecast" },
  { until: 99, label: "Waiting on your details" },
  { until: 100, label: "Done" },
];

type Props = {
  /** Total expected duration in ms while we wait for analysis */
  durationMs?: number;
  /** When true, finish the bar to 100% */
  finalize?: boolean;
  /** Whether the underlying analysis has returned */
  analysisReady?: boolean;
  /** Whether the lead form has been submitted */
  formSubmitted?: boolean;
};

export function AnalyzingProgress({
  durationMs = 60000,
  finalize = false,
  analysisReady = false,
  formSubmitted = false,
}: Props) {
  const [pct, setPct] = useState(0);
  const completedRef = useRef(false);

  // Initial ease toward 99% while we wait
  useEffect(() => {
    if (finalize) return;
    const start = Date.now();
    const tickMs = 250;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const linear = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - linear, 2);
      setPct((cur) => {
        const next = Math.min(99, Math.round(eased * 100));
        return next > cur ? next : cur;
      });
      if (linear >= 1) clearInterval(id);
    }, tickMs);
    return () => clearInterval(id);
  }, [durationMs, finalize]);

  // Finalize: animate to 100%
  useEffect(() => {
    if (!finalize) return;
    let raf = 0;
    const start = performance.now();
    const from = pct;
    const dur = 900;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (100 - from) * eased);
      setPct(value);
      if (t < 1) raf = requestAnimationFrame(tick);
      else completedRef.current = true;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalize]);

  const stage = STAGES.find((s) => pct <= s.until) ?? STAGES[STAGES.length - 1];

  const subtext = formSubmitted
    ? analysisReady
      ? "Loading your audit"
      : "Lead saved. Finishing the analysis"
    : analysisReady
    ? "Analysis ready. Unlock with the form to view"
    : "Your audit will be unlocked once you tell us about your business";

  return (
    <div className="rounded-3xl bg-white border border-hub-ink/10 p-6 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-hub-orange animate-pulse" />
          <span className="text-sm font-medium text-hub-navy">
            {stage.label}
          </span>
        </div>
        <div className="font-serif text-2xl text-hub-navy tabular-nums">
          {pct}
          <span className="text-base text-hub-ink/40">%</span>
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-hub-bg overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-hub-orange to-hub-yellow transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        />
      </div>

      <p className="mt-4 text-xs text-hub-ink/50">{subtext}.</p>
    </div>
  );
}
