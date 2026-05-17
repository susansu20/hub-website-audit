"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Is this actually free?",
    a: "Yes. Free audit, no signup, no credit card. If we earn your trust, you'll book a strategy call. If we don't, you'll still have your audit.",
  },
  {
    q: "How accurate is the era and score?",
    a: "The audit uses Claude vision plus Google PageSpeed Insights and live HTML to evaluate 10 specific UX questions. It's directionally sharp, and consistent enough that Susan uses the same framework on every paid engagement.",
  },
  {
    q: "Where does the lead forecast come from?",
    a: "From Hub Solutions' anonymized client data across 50+ Singapore SME websites. Actual results depend on traffic, industry, and offer, which is why we always show a range, not a single number.",
  },
  {
    q: "Do you store or share my website data?",
    a: "We cache audit results for 24 hours so repeat checks are fast. We don't sell, share, or republish anything. The only person who sees the results is you, and Susan if you book a strategy call.",
  },
  {
    q: "What happens after I get my audit?",
    a: "If your score is under 5, we'll suggest a free 15-minute strategy call. If you're 5 to 8, we'll show you the three highest-ROI fixes. If you're 8 or above, we'll tell you exactly that and stay out of your way.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white border-y border-hub-ink/10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
            Common questions
          </div>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-hub-navy text-balance">
            Before you paste your URL.
          </h2>
        </div>

        <div className="mt-12 border-t border-hub-ink/10">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q} className="border-b border-hub-ink/10">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-6 cursor-pointer"
                >
                  <span className="font-serif text-xl text-hub-navy">
                    {faq.q}
                  </span>
                  <span
                    aria-hidden
                    className={`h-8 w-8 shrink-0 rounded-full border border-hub-ink/15 flex items-center justify-center text-hub-navy transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                {isOpen ? (
                  <div
                    id={`faq-panel-${i}`}
                    className="pb-5 pr-14 text-hub-ink/70 text-pretty"
                  >
                    {faq.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
