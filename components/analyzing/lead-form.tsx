"use client";

import { useState } from "react";
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

type Props = {
  url: string;
  onSubmit: (payload: LeadPayload) => void;
};

type FormState = {
  name: string;
  email: string;
  salesSource: SalesSource | "";
  websiteGoals: WebsiteGoal[];
  transactionVolume: TransactionVolume | "";
  transactionValue: TransactionValue | "";
};

const initial: FormState = {
  name: "",
  email: "",
  salesSource: "",
  websiteGoals: [],
  transactionVolume: "",
  transactionValue: "",
};

export function LeadForm({ url, onSubmit }: Props) {
  const [state, setState] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    if (error) setError(null);
  }

  function toggleGoal(goal: WebsiteGoal) {
    setState((s) => {
      const has = s.websiteGoals.includes(goal);
      return {
        ...s,
        websiteGoals: has
          ? s.websiteGoals.filter((g) => g !== goal)
          : [...s.websiteGoals, goal],
      };
    });
    if (error) setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!state.name.trim()) return setError("Tell us your name.");
    if (!isValidEmail(state.email)) return setError("That email doesn't look right.");
    if (!state.salesSource) return setError("Pick where your sales are coming from.");
    if (state.websiteGoals.length === 0) return setError("Pick at least one thing you want the website to do.");
    if (!state.transactionVolume) return setError("Pick your transaction volume.");
    if (!state.transactionValue) return setError("Pick your average transaction value.");

    const payload: LeadPayload = {
      name: state.name.trim(),
      email: state.email.trim(),
      url,
      salesSource: state.salesSource,
      websiteGoals: state.websiteGoals,
      transactionVolume: state.transactionVolume,
      transactionValue: state.transactionValue,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      <div>
        <h2 className="font-serif text-3xl text-hub-navy">
          Almost there. Let&rsquo;s see what you&rsquo;re missing.
        </h2>
        <p className="mt-2 text-hub-ink/60">
          Six quick questions so your audit reflects the leads your business is
          actually built to win.
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
          />
        </Field>
      </div>

      <SingleSelect
        label="Where is your business currently getting its sales from?"
        name="salesSource"
        value={state.salesSource}
        options={SALES_SOURCES}
        onChange={(v) => update("salesSource", v as SalesSource)}
      />

      <MultiSelect
        label="What would you like your website to do for you?"
        hint="Pick all that apply."
        name="websiteGoals"
        values={state.websiteGoals}
        options={WEBSITE_GOALS}
        onToggle={(v) => toggleGoal(v as WebsiteGoal)}
      />

      <SingleSelect
        label="On average, how many transactions does your business process per month?"
        name="transactionVolume"
        value={state.transactionVolume}
        options={TRANSACTION_VOLUMES}
        onChange={(v) => update("transactionVolume", v as TransactionVolume)}
      />

      <SingleSelect
        label="What's the average value of each transaction?"
        name="transactionValue"
        value={state.transactionValue}
        options={TRANSACTION_VALUES}
        onChange={(v) => update("transactionValue", v as TransactionValue)}
      />

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-hub-navy px-7 py-4 text-base font-medium text-white hover:bg-hub-navy/90 transition-colors"
        >
          Show me my audit
        </button>
        <p className="mt-3 text-xs text-hub-ink/50">
          We only use this to tailor your audit and follow up. No spam, ever.
        </p>
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

function SingleSelect<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
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
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function MultiSelect<T extends string>({
  label,
  hint,
  name,
  values,
  options,
  onToggle,
}: {
  label: string;
  hint?: string;
  name: string;
  values: T[];
  options: readonly { value: T; label: string }[];
  onToggle: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-hub-navy">{label}</legend>
      {hint ? (
        <div className="mt-0.5 text-xs text-hub-ink/50">{hint}</div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = values.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors inline-flex items-center gap-2 ${
                selected
                  ? "bg-hub-navy text-white border-hub-navy"
                  : "bg-white text-hub-ink/80 border-hub-ink/15 hover:border-hub-navy/40"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onToggle(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                  selected
                    ? "bg-white text-hub-navy border-white"
                    : "border-hub-ink/25"
                }`}
              >
                {selected ? "✓" : ""}
              </span>
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const textInputCls =
  "w-full rounded-xl border border-hub-ink/15 bg-white px-4 py-3 text-base placeholder:text-hub-ink/40 focus:outline-none focus:ring-2 focus:ring-hub-orange/50 focus:border-hub-orange";
