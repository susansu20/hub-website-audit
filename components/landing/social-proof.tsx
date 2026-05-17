import { Star } from "lucide-react";

type Block = { kind: "text"; value: string } | { kind: "ellipsis" };

const quotes: {
  name: string;
  role: string;
  blocks: Block[];
}[] = [
  {
    name: "Nicholas Foo",
    role: "SME Owner",
    blocks: [
      {
        kind: "text",
        value:
          "Susan knows her stuff. She's sharp on Shopify, quick with website technical fixes, and genuinely understands CRO, not just surface-level tweaks.",
      },
      { kind: "ellipsis" },
      {
        kind: "text",
        value:
          "If you need someone reliable who actually understands what they're doing, Susan is a solid choice.",
      },
    ],
  },
  {
    name: "Luna Teo",
    role: "Florist Brand Owner",
    blocks: [
      {
        kind: "text",
        value:
          "I've engaged Susan's help to address deep technical issues on our Shopify platform which I had no idea that I needed in order for our ads to run better. Susan is very easy to work with, responsive and report is easy to understand too. Highly recommended! :)",
      },
    ],
  },
  {
    name: "Delene Lee",
    role: "Construction Industry",
    blocks: [
      {
        kind: "text",
        value:
          "Excellent and value for money. I've done up 5-6 websites before, each time with different vendors, and honestly this is by far the best web development experience.",
      },
      { kind: "ellipsis" },
      {
        kind: "text",
        value:
          "So grateful for the over and beyond service, thank you Susan and team!!! :)",
      },
    ],
  },
];

export function SocialProof() {
  return (
    <section className="bg-hub-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-hub-orange font-semibold">
            <div className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            5.0 from 100+ clients
          </div>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-hub-navy text-balance">
            How we helped businesses 5x their sales in 5 weeks.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:auto-rows-fr">
          {quotes.map((q) => (
            <figure
              key={q.name}
              className="h-full rounded-3xl bg-white border border-hub-ink/10 p-6 sm:p-8 flex flex-col"
            >
              <div
                className="flex items-center gap-0.5 text-hub-orange"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <blockquote className="mt-4 text-hub-ink/80 text-pretty space-y-3">
                {q.blocks.map((b, i) =>
                  b.kind === "ellipsis" ? (
                    <p
                      key={i}
                      aria-hidden
                      className="text-center text-hub-ink/30 tracking-[0.4em] text-xs select-none"
                    >
                      ···
                    </p>
                  ) : (
                    <p key={i}>{b.value}</p>
                  )
                )}
              </blockquote>

              <figcaption className="mt-auto pt-6">
                <div className="pt-4 border-t border-hub-ink/10">
                  <div className="font-medium text-hub-navy">{q.name}</div>
                  <div className="text-sm text-hub-ink/60">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
