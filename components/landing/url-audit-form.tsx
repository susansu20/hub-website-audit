"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { validateAndNormalizeUrl } from "@/lib/url";

type Props = {
  size?: "default" | "lg";
};

export function UrlAuditForm({ size = "default" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = validateAndNormalizeUrl(value);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    startTransition(() => {
      router.push(`/analyzing?url=${encodeURIComponent(result.normalized)}`);
    });
  }

  const inputCls =
    size === "lg"
      ? "px-6 py-4 text-lg"
      : "px-5 py-3.5 text-base";
  const btnCls =
    size === "lg" ? "px-7 py-4 text-base" : "px-6 py-3.5 text-base";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl" noValidate>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="yourbusiness.com"
            aria-label="Your website URL"
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "url-error" : undefined}
            className={`w-full rounded-full border bg-white placeholder:text-hub-ink/40 focus:outline-none focus:ring-2 focus:ring-hub-orange/50 transition-colors ${inputCls} ${
              error
                ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                : "border-hub-ink/15 focus:border-hub-orange"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-full bg-hub-navy font-medium text-white hover:bg-hub-navy/90 transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2 disabled:opacity-70 ${btnCls}`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              Audit my site
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {error ? (
        <p id="url-error" role="alert" className="mt-2 px-2 text-sm text-red-600">
          {error}
        </p>
      ) : (
        <p className="mt-2 px-2 text-xs text-hub-ink/50">
          Free · No signup · Results in 60 seconds
        </p>
      )}
    </form>
  );
}
