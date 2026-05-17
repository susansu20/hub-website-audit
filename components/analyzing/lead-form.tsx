"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  SALES_SOURCES,
  TRANSACTION_VALUES,
  TRANSACTION_VOLUMES,
  WEBSITE_GOALS,
  isValidEmail,
  type LeadPayload,
  type SalesSource,
  type TransactionValue,
  type TransactionVolume,
  type WebsiteGoal,
} from "@/lib/lead";
import type { AnalysisResult } from "@/lib/types";

type Props = {
  url: string;
  analysis: AnalysisResult | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  email: string;
  salesSource: SalesSource | "";
  websiteGoal: WebsiteGoal | "";
  transactionVolume: TransactionVolume | "";
  transactionValue: TransactionValue | "";
};

const initial: FormState = {
  name: "",
  email: "",
  salesSource: "",
  websiteGoal: "",
  transactionVolume: "",
  transactionValue: "",
};

export function LeadForm({ url, analysis, onSuccess }: Props) {
  const [state, setState] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [waitingForAudit, setWaitingForAudit] = useState(false);
  const pendingPayloadRef = useRef<LeadPayload | null>(null);
  const submittedRef = useRef(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    if (error) setError(null);
  }

  async function postLead(payload: LeadPayload, audit: AnalysisResult) {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, analysis: audit }),
    });
    if (!res.ok) throw new Error("Submission failed");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittedRef.current) return;
    if (!state.name.trim()) return setError("Tell us your name.");
    if (!isValidEmail(state.email)) return setError("That email doesn't look right.");
    if (!state.salesSource) return setError("Pick where your sales are coming from.");
    if (!state.websiteGoal) return setError("Pick what you want the website to do.");
    if (!state.transactionVolume) return setError("Pick your transaction volume.");
    if (!state.transactionValue) return setError("Pick your average transaction value.");

    const payload: LeadPayload = {
      name: state.name.trim(),
      email: state.email.trim(),
      url,
      salesSource: state.salesSource,
      websiteGoal: state.websiteGoal,
      transactionVolume: state.transactionVolume,
      transactionValue: state.transactionValue,
    };

    setSubmitting(true);
    pendingPayloadRef.current = payload;

    if (!analysis) {
      setWaitingForAudit(true);
      return;
    }

    submittedRef.current = true;
    try {
      await postLead(payload, analysis);
      onSuccess();
    } catch {
      setSubmitting(false);
      submittedRef.current = false;
      pendingPayloadRef.current = null;
      setError("Couldn't save that. Try again in a second.");
    }
  }

  // Once the analysis arrives, fire the pending submission
  useEffect(() => {
    if (!analysis) return;
    if (!pendingPayloadRef.current) return;
    if (submittedRef.current) return;
    const payload = pendingPayloadRef.current;
    submittedRef.current = true;
    (async () => {
      try {
        await postLead(payload, analysis);
        onSuccess();
      } catch {
        setSubmitting(false);
        setWaitingForAudit(false);
        submittedRef.current = false;
        pendingPayloadRef.current = null;
        setError("Couldn't save that. Try again in a second.");
      }
    })();
  }, [analysis, onSuccess]);

  const buttonLabel = waitingForAudit
    ? "Finalizing your audit"
    : submitting
    ? "Saving"
    : "Show me my audit";

  return (
    <form onSubmit={onSubmit} className="space-y-7" noValidate>
      <div>
        <h2 className="font-serif text-3xl text-hub-navy">
          While we work, tell us about your business.
        </h2>
        <p className="mt-2 text-hub-ink/60">
          Six quick questions so Susan can tailor your audit and your strategy
          call.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name">
          <input
            type="text"
            autoComplete="name"
            required
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Tan"
            className={textInputCls}
            disabled={submitting}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            autoComplete="email"
            required
            inputMode="email"
            value={state.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@yourbusiness.com"
            className={textInputCls}
            disabled={submitting}
          />
        </Field>
      </div>

      <RadioGroup
        label="Where is your business currently getting its sales from?"
        name="salesSource"
        value={state.salesSource}
        options={SALES_SOURCES}
        onChange={(v) => update("salesSource", v as SalesSource)}
        disabled={submitting}
      />

      <RadioGroup
        label="What would you like your website to do for you?"
        name="websiteGoal"
        value={state.websiteGoal}
        options={WEBSITE_GOALS}
        onChange={(v) => update("websiteGoal", v as WebsiteGoal)}
        disabled={submitting}
      />

      <RadioGroup
        label="On average, how many transactions does your business process per month?"
        name="transactionVolume"
        value={state.transactionVolume}
        options={TRANSACTION_VOLUMES}
        onChange={(v) => update("transactionVolume", v as TransactionVolume)}
        disabled={submitting}
      />

      <RadioGroup
        label="What's the average value of each transaction?"
        name="transactionValue"
        value={state.transactionValue}
        options={TRANSACTION_VALUES}
        onChange={(v) => update("transactionValue", v as TransactionValue)}
        disabled={submitting}
      />

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-hub-navy px-7 py-4 text-base font-medium text-white hover:bg-hub-navy/90 transition-colors disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {buttonLabel}
        </button>
        {waitingForAudit ? (
          <p className="mt-3 text-xs text-hub-ink/50">
            Hold tight, we&rsquo;ll take you straight to your audit when it&rsquo;s ready.
          </p>
        ) : (
          <p className="mt-3 text-xs text-hub-ink/50">
            We only use this to tailor your audit and follow up. No spam, ever.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-hub-navy">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function RadioGroup<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-medium text-hub-navy">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                selected
                  ? "bg-hub-navy text-white border-hub-navy"
                  : "bg-white text-hub-ink/80 border-hub-ink/15 hover:border-hub-navy/40"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
                disabled={disabled}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const textInputCls =
  "w-full rounded-xl border border-hub-ink/15 bg-white px-4 py-3 text-base placeholder:text-hub-ink/40 focus:outline-none focus:ring-2 focus:ring-hub-orange/50 focus:border-hub-orange disabled:opacity-60";
