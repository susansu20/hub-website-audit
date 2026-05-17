import { CalendarClock, Gauge, LineChart, Lock, Star } from "lucide-react";
import { UrlAuditForm } from "./url-audit-form";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 70% 20%, rgba(247,148,29,0.18), transparent 60%), radial-gradient(50% 40% at 15% 90%, rgba(255,199,44,0.18), transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-hub-ink/10 bg-white px-3 py-1 text-xs font-medium text-hub-navy shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-hub-orange animate-pulse" />
              Hub Solutions Audit · Free · 60 seconds
            </div>

            <h1 className="mt-5 font-serif text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] text-hub-navy">
              What era is your{" "}
              <span className="italic text-hub-orange">website</span> stuck in?
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-lg text-hub-ink/70">
              Paste your URL. Get your era verdict, UX score, and 90-day lead
              forecast, scored against the framework Susan uses with paying
              clients.
            </p>

            <div className="mt-8" id="audit-form">
              <UrlAuditForm size="lg" />
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-hub-ink/70">
              <div className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current text-hub-orange"
                  />
                ))}
              </div>
              <span className="font-semibold text-hub-navy">5.0</span>
              <span className="text-hub-ink/40">·</span>
              <span>
                Rated by{" "}
                <span className="font-semibold text-hub-navy">100+</span>{" "}
                clients
              </span>
            </div>
          </div>

          <MetricsPyramid />
        </div>
      </div>
    </section>
  );
}

function MetricsPyramid() {
  return (
    <div className="relative">
      <div className="text-center mb-6">
        <div className="text-xs uppercase tracking-widest text-hub-ink/50">
          You&rsquo;ll walk away with
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <MetricCard
          width="w-full"
          icon={<CalendarClock className="h-5 w-5" />}
          label="Era verdict"
          value="Your site is from 2017"
          sub="Flat design era · Pre-mobile thinking"
          tone="navy"
        />

        <MetricCard
          width="w-[82%]"
          icon={<Gauge className="h-5 w-5" />}
          label="UX score"
          value="6.5 / 10"
          sub="Hustle Mode · Effort doing the work"
          tone="orange"
        />

        <MetricCard
          width="w-[62%]"
          icon={<LineChart className="h-5 w-5" />}
          label="90-day lead forecast"
          value="12 → 45 leads"
          sub="The cost of staying as-is"
          tone="yellow"
          locked
        />
      </div>

      <div className="mt-5 text-center text-xs text-hub-ink/50 italic">
        The forecast is the part most owners ignore.
      </div>

      <div className="absolute -top-3 -right-3 rounded-full bg-hub-yellow px-3 py-1 text-xs font-semibold text-hub-navy rotate-3 shadow-sm">
        Yours in 60 seconds
      </div>
    </div>
  );
}

function MetricCard({
  width,
  icon,
  label,
  value,
  sub,
  tone,
  locked,
}: {
  width: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "navy" | "orange" | "yellow";
  locked?: boolean;
}) {
  const toneClasses =
    tone === "navy"
      ? "bg-hub-navy text-white"
      : tone === "orange"
      ? "bg-hub-orange text-white"
      : "bg-hub-yellow text-hub-navy";

  const labelColor =
    tone === "yellow" ? "text-hub-navy/60" : "text-white/60";
  const subColor =
    tone === "yellow" ? "text-hub-navy/70" : "text-white/75";

  return (
    <div
      className={`relative ${width} ${toneClasses} rounded-2xl px-5 sm:px-6 py-4 sm:py-5 shadow-[0_15px_40px_-20px_rgba(27,42,94,0.45)] overflow-hidden`}
    >
      <div
        className={`transition-all ${
          locked ? "blur-[5px] select-none" : ""
        }`}
        aria-hidden={locked}
      >
        <div className="flex items-center gap-2">
          {icon}
          <div
            className={`text-[11px] uppercase tracking-widest font-semibold ${labelColor}`}
          >
            {label}
          </div>
        </div>
        <div className="mt-2 font-serif text-2xl sm:text-3xl">{value}</div>
        <div className={`mt-1 text-sm ${subColor}`}>{sub}</div>
      </div>

      {locked ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-hub-navy shadow-md">
            <Lock className="h-3 w-3" />
            Run the audit to unlock
          </div>
        </div>
      ) : null}
    </div>
  );
}
