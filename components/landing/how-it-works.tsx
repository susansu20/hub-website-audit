const steps = [
  {
    n: "01",
    title: "Paste your URL",
    body: "Drop any public website. We handle the rest. No signup, no account, no sales call required.",
  },
  {
    n: "02",
    title: "We capture & analyze",
    body: "Full-page desktop and mobile screenshots, HTML structure, and Google PageSpeed data all run through our scoring model.",
  },
  {
    n: "03",
    title: "Get your verdict",
    body: "Era, UX score, lead forecast, and per-question breakdown. All landing in your browser in under 90 seconds.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-hub-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
              How it works
            </div>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-hub-navy text-balance max-w-2xl">
              60 seconds. Zero effort. The kind of clarity that usually costs $2,000.
            </h2>
          </div>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.n}
              className="rounded-3xl bg-white border border-hub-ink/10 p-6 sm:p-8"
            >
              <div className="font-serif text-5xl text-hub-orange leading-none">
                {step.n}
              </div>
              <h3 className="mt-4 font-serif text-2xl text-hub-navy">
                {step.title}
              </h3>
              <p className="mt-3 text-hub-ink/70 text-pretty">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
