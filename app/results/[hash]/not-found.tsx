import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-hub-bg min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-xs uppercase tracking-widest text-hub-orange font-semibold">
          Audit not found
        </div>
        <h1 className="mt-3 font-serif text-4xl text-hub-navy">
          That audit has expired or never existed.
        </h1>
        <p className="mt-3 text-hub-ink/60">
          Audits are cached for 24 hours. Run a fresh one on the home page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-full bg-hub-navy px-6 py-3 text-sm font-medium text-white hover:bg-hub-navy/90 transition-colors"
        >
          Run a new audit
        </Link>
      </div>
    </div>
  );
}
