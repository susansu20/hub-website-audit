import { UrlAuditForm } from "./url-audit-form";

export function FinalCta() {
  return (
    <section className="bg-hub-navy text-white relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(40% 80% at 10% 50%, rgba(247,148,29,0.35), transparent 60%), radial-gradient(40% 80% at 90% 50%, rgba(255,199,44,0.25), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-28 text-center">
        <h2 className="font-serif text-4xl sm:text-6xl text-balance leading-[1.05]">
          Find out what era your website is stuck in.
        </h2>
        <p className="mt-5 text-lg text-white/70 text-pretty max-w-2xl mx-auto">
          Sixty seconds. No signup. Either you&rsquo;ll feel great about your
          site, or you&rsquo;ll know exactly what to fix.
        </p>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-xl text-left">
            <UrlAuditForm size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
