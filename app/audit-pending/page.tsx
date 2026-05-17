import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Mail, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Your manual audit is on the way",
  description:
    "Our automated tool couldn't capture your site. Susan is taking it from here and will be in touch within 24 hours.",
};

const reasons = [
  {
    title: "Bot protection",
    body: "Cloudflare, anti-DDoS, or a strict WAF blocked our crawler. Common on newer or heavily protected sites.",
  },
  {
    title: "Slow or busy server",
    body: "Your site took longer than 60 seconds to render. Often a hosting or traffic spike, not a build problem.",
  },
  {
    title: "Login or paywall",
    body: "Key pages sit behind authentication, which our automated tool respects and skips.",
  },
  {
    title: "Heavy single-page app",
    body: "JavaScript-rendered content that needs extended runtime or specific interactions to surface.",
  },
];

export default function AuditPendingPage() {
  const bookingUrl = process.env.HUB_SOLUTIONS_BOOKING_URL ?? "#";

  return (
    <div className="bg-hub-bg min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-hub-yellow text-hub-navy px-4 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Manual audit incoming
          </div>
          <h1 className="mt-5 font-serif text-5xl sm:text-6xl text-hub-navy text-balance">
            Thanks. Susan is taking it from here.
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-hub-ink/70 text-pretty">
            Our automated tool couldn&rsquo;t capture your site. That&rsquo;s
            usually a signal about how your site treats bots, not a problem with
            your business. Susan will manually review and send you the full
            audit within 24 hours.
          </p>
        </div>

        <section className="mt-12 rounded-3xl bg-white border border-hub-ink/10 p-6 sm:p-10">
          <h2 className="font-serif text-2xl text-hub-navy">
            Why automated capture sometimes fails
          </h2>
          <p className="mt-2 text-sm text-hub-ink/60">
            One of these four is almost always the reason.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {reasons.map((r) => (
              <li
                key={r.title}
                className="rounded-2xl bg-hub-bg/60 border border-hub-ink/10 p-5"
              >
                <div className="font-medium text-hub-navy">{r.title}</div>
                <p className="mt-1 text-sm text-hub-ink/70 text-pretty">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-hub-ink/60 text-pretty">
            None of these are dealbreakers. They&rsquo;re actually signals that
            your site needs a human eye, which is what you&rsquo;re getting.
          </p>
        </section>

        <section className="mt-8 rounded-3xl bg-white border border-hub-ink/10 p-6 sm:p-10">
          <h2 className="font-serif text-2xl text-hub-navy">What happens next</h2>
          <ol className="mt-6 space-y-5">
            <Step n={1} icon={<Mail className="h-5 w-5 text-hub-orange" />} title="Check your inbox">
              We&rsquo;ve sent a confirmation to the email you submitted. Add{" "}
              <code className="text-[13px] bg-hub-bg px-1 py-0.5 rounded">
                audit@hubsolutions.one
              </code>{" "}
              to your safe senders so the audit doesn&rsquo;t end up in spam.
            </Step>
            <Step n={2} icon={<ShieldCheck className="h-5 w-5 text-hub-orange" />} title="Susan reviews your site by hand">
              Within 24 hours, against the same 10-point framework the
              automated tool would have used.
            </Step>
            <Step n={3} icon={<Calendar className="h-5 w-5 text-hub-orange" />} title="You get the audit + a strategy call invite">
              The audit lands in your inbox with the top three fixes and a
              calendar link.
            </Step>
          </ol>
        </section>

        <section className="mt-8 rounded-3xl bg-hub-navy text-white p-8 sm:p-12 text-center">
          <h2 className="font-serif text-3xl text-balance">
            Want to skip the wait?
          </h2>
          <p className="mt-3 text-white/70 text-pretty max-w-xl mx-auto">
            Book a 15-minute strategy call now. Susan will walk through your
            site live and give you the top three fixes on the call.
          </p>
          <Link
            href={bookingUrl}
            target={bookingUrl.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-hub-orange px-7 py-4 text-base font-semibold text-hub-navy hover:bg-hub-yellow transition-colors"
          >
            Book my strategy call
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-hub-ink/60 hover:text-hub-navy"
          >
            ← Back to the audit
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  icon,
  children,
}: {
  n: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="shrink-0 h-10 w-10 rounded-full bg-hub-bg border border-hub-ink/10 flex items-center justify-center">
        {icon}
      </span>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-hub-ink/40">
            Step {n}
          </span>
        </div>
        <div className="font-medium text-hub-navy">{title}</div>
        <div className="mt-1 text-sm text-hub-ink/70 text-pretty">
          {children}
        </div>
      </div>
    </li>
  );
}
