import { Lock } from "lucide-react";

const layers = [
  {
    label: "Positioning",
    count: "4 questions",
    body: "Who you serve. What result you deliver. Why now.",
    width: "w-[55%]",
    color: "bg-hub-navy text-white",
    locked: true,
  },
  {
    label: "Experience",
    count: "3 questions",
    body: "Navigation. Page speed. Clear next steps.",
    width: "w-[75%]",
    color: "bg-hub-orange text-white",
    locked: true,
  },
  {
    label: "Trust",
    count: "3 questions",
    body: "Hero. Social proof. Visual consistency.",
    width: "w-full",
    color: "bg-hub-yellow text-hub-navy",
    locked: false,
  },
];

export function FrameworkTeaser() {
  return (
    <section className="bg-white border-y border-hub-ink/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
              The framework
            </div>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-hub-navy text-balance">
              The Hub Solutions Conversion Pyramid.
            </h2>
            <p className="mt-4 text-lg text-hub-ink/70 text-pretty">
              Every revamp Susan ships is built on the same 10-point framework,
              split across three layers. Your audit scores every question with
              a YES, MAYBE, or NO. The deeper layers are unlocked on your
              strategy call.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {layers.map((layer) => (
              <div
                key={layer.label}
                className={`relative ${layer.width} ${layer.color} rounded-2xl px-6 py-5 shadow-sm overflow-hidden`}
              >
                <div
                  className={`transition-all ${
                    layer.locked ? "blur-sm select-none" : ""
                  }`}
                  aria-hidden={layer.locked}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-serif text-xl">{layer.label}</div>
                    <div className="text-xs opacity-70">{layer.count}</div>
                  </div>
                  <div className="mt-1 text-sm opacity-80">{layer.body}</div>
                </div>

                {layer.locked ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-hub-navy shadow-sm">
                      <Lock className="h-3 w-3" />
                      Unlocked on your call
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            <div className="mt-2 text-xs text-hub-ink/50 italic">
              Foundation up. Fix the base first.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
