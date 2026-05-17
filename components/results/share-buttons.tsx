"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  host: string;
  era: string;
  scoreLabel: string;
};

export function ShareButtons({ host, era, scoreLabel }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${host} got ${scoreLabel} on the Hub Solutions website audit. ${era}`;

  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const xHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  async function onCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-white border border-hub-ink/15 px-4 py-2 text-sm font-medium text-hub-navy hover:bg-hub-bg transition-colors"
      >
        <LinkedinLogo />
        Share on LinkedIn
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-white border border-hub-ink/15 px-4 py-2 text-sm font-medium text-hub-navy hover:bg-hub-bg transition-colors"
      >
        <XLogo />
        Share on X
      </a>
      <button
        type="button"
        onClick={onCopy}
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-full bg-white border border-hub-ink/15 px-4 py-2 text-sm font-medium text-hub-navy hover:bg-hub-bg transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            Link copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}

function LinkedinLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 fill-current"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .771 0 1.723v20.554C0 23.229.792 24 1.771 24h20.451c.978 0 1.778-.771 1.778-1.723V1.723C24 .771 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

function XLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 fill-current"
    >
      <path d="M18.244 2H21.5l-7.493 8.567L23 22h-6.844l-5.36-7.013L4.6 22H1.34l8.018-9.166L1 2h7.014l4.846 6.4Zm-1.2 18h1.9L7.04 4H5.07Z" />
    </svg>
  );
}
