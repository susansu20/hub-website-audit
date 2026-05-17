"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";
import { AnalyzingProgress } from "./progress-bar";
import { LeadForm } from "./lead-form";
import type { AnalysisResult } from "@/lib/types";

type Props = { url: string };

const MODAL_DELAY_MS = 5000;

type AnalysisState =
  | { status: "running" }
  | { status: "ready"; result: AnalysisResult }
  | { status: "error"; message: string };

export function AnalyzingExperience({ url }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "running" });

  // Kick off the real analysis on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setAnalysis({
            status: "error",
            message: data.error ?? `Analysis failed (HTTP ${res.status})`,
          });
          return;
        }
        const result = data.result as AnalysisResult;
        try {
          sessionStorage.setItem(`audit:${result.hash}`, JSON.stringify(result));
        } catch {
          // sessionStorage may be unavailable in some browsers / private modes
        }
        setAnalysis({ status: "ready", result });
      } catch (err) {
        if (cancelled) return;
        setAnalysis({
          status: "error",
          message: err instanceof Error ? err.message : "Could not reach the analyzer.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Open the lead modal after a short reading delay (only if no error)
  useEffect(() => {
    if (analysis.status === "error") return;
    const id = window.setTimeout(() => setModalOpen(true), MODAL_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [analysis.status]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  function onFormSuccess() {
    setFormSubmitted(true);
    setModalOpen(false);
    if (analysis.status === "ready") {
      window.setTimeout(() => {
        router.push(`/results/${analysis.result.hash}`);
      }, 700);
    }
  }

  const finalize = formSubmitted && analysis.status === "ready";
  const errored = analysis.status === "error";
  const analysisResult = analysis.status === "ready" ? analysis.result : null;

  return (
    <div className="bg-hub-bg min-h-screen">
      <div
        className={`mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24 transition-[filter] duration-300 ${
          modalOpen ? "blur-[3px] pointer-events-none select-none" : ""
        }`}
        aria-hidden={modalOpen}
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hub-ink/10 bg-white px-3 py-1 text-xs font-medium text-hub-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-hub-orange animate-pulse" />
            Analyzing
          </div>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl text-hub-navy text-balance">
            Crunching your audit.
          </h1>
          <p className="mt-2 text-sm text-hub-ink/60 break-all">{url}</p>
        </div>

        {errored ? (
          <ErrorState
            message={analysis.status === "error" ? analysis.message : "Unknown error"}
            onRetry={() => router.push("/")}
          />
        ) : (
          <>
            <div className="mt-10">
              <AnalyzingProgress
                finalize={finalize}
                analysisReady={analysis.status === "ready"}
                formSubmitted={formSubmitted}
              />
            </div>

            <div className="mt-8 rounded-2xl bg-white border border-hub-ink/10 p-6 text-center">
              <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
                Did you know
              </div>
              <p className="mt-2 text-hub-ink/70 text-pretty">
                88% of online users won&rsquo;t return to a site after a bad
                experience. Your audit checks for the exact triggers that cause
                them to bounce.
              </p>
            </div>
          </>
        )}
      </div>

      {modalOpen ? (
        <Modal>
          <LeadForm
            url={url}
            analysis={analysisResult}
            onSuccess={onFormSuccess}
          />
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-hub-navy/45 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl bg-white sm:rounded-3xl shadow-[0_30px_80px_-30px_rgba(27,42,94,0.45)] border border-hub-ink/10 overflow-hidden flex flex-col max-h-full">
        <div className="px-6 sm:px-8 py-4 border-b border-hub-ink/10 bg-hub-bg">
          <div className="flex items-center gap-2 text-xs font-semibold text-hub-navy uppercase tracking-widest">
            <Lock className="h-3.5 w-3.5 text-hub-orange" />
            Unlock your audit
          </div>
        </div>

        <div className="overflow-y-auto px-6 sm:px-10 py-8 sm:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-10 rounded-3xl bg-white border border-red-200 p-8 text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-serif text-2xl text-hub-navy">
        We couldn&rsquo;t finish your audit.
      </h2>
      <p className="mt-2 text-sm text-hub-ink/70">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-hub-navy px-6 py-3 text-sm font-medium text-white hover:bg-hub-navy/90 transition-colors"
      >
        Try a different URL
      </button>
    </div>
  );
}
