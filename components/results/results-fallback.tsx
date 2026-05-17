"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResultsView } from "./results-view";
import type { AnalysisResult } from "@/lib/types";
import { SCHEMA_VERSION } from "@/lib/types";

type Props = { hash: string };

type State =
  | { status: "checking" }
  | { status: "found"; result: AnalysisResult }
  | { status: "missing" };

function isValid(result: unknown): result is AnalysisResult {
  if (!result || typeof result !== "object") return false;
  const v = result as Record<string, unknown>;
  return (
    typeof v.hash === "string" &&
    typeof v.score === "number" &&
    v.version === SCHEMA_VERSION &&
    Array.isArray(v.questions) &&
    v.questions.length === 10
  );
}

export function ResultsFallback({ hash }: Props) {
  const [state, setState] = useState<State>({ status: "checking" });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`audit:${hash}`);
      if (!raw) {
        setState({ status: "missing" });
        return;
      }
      const parsed = JSON.parse(raw);
      if (!isValid(parsed)) {
        setState({ status: "missing" });
        return;
      }
      if (parsed.hash !== hash) {
        setState({ status: "missing" });
        return;
      }
      setState({ status: "found", result: parsed });
    } catch {
      setState({ status: "missing" });
    }
  }, [hash]);

  if (state.status === "checking") {
    return (
      <div className="bg-hub-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-hub-orange border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-hub-ink/60">Loading your audit…</p>
        </div>
      </div>
    );
  }

  if (state.status === "found") {
    return <ResultsView result={state.result} />;
  }

  return (
    <div className="bg-hub-bg min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
          Audit not found
        </div>
        <h1 className="mt-3 font-serif text-4xl text-hub-navy">
          That audit has expired or never existed.
        </h1>
        <p className="mt-3 text-hub-ink/60">
          Audits are cached for 24 hours. Run a fresh one on the home page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-full bg-hub-navy px-6 py-3 text-sm font-medium text-white hover:bg-hub-navy/90 transition-colors"
        >
          Run a new audit
        </Link>
      </div>
    </div>
  );
}
