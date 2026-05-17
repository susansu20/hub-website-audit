import { NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analysis";
import { validateAndNormalizeUrl } from "@/lib/url";
import { checkAnalyzeRate } from "@/lib/rate-limit";

// Analysis can take up to ~90s (screenshots + PageSpeed + Claude vision).
export const maxDuration = 120;
export const dynamic = "force-dynamic";

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const validation = validateAndNormalizeUrl(body.url ?? "");
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, error: validation.reason },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  try {
    const rate = await checkAnalyzeRate(ip);
    if (!rate.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "You have hit the audit limit. Try again in an hour.",
        },
        { status: 429 }
      );
    }
  } catch (err) {
    console.warn("[analyze] rate-limit check failed, proceeding:", err);
  }

  try {
    const result = await runAnalysis(validation.normalized);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Analysis failed";
    console.error("[analyze] failed:", raw);
    return NextResponse.json(
      { ok: false, error: friendlyError(raw) },
      { status: 502 }
    );
  }
}

function friendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("screenshot")) {
    return "We couldn't capture your site. It may be slow to load or temporarily unavailable. Try again in a moment.";
  }
  if (m.includes("could not fetch html") || m.includes("did not return html")) {
    return "We couldn't load your site. Check the URL is reachable and returns a normal web page.";
  }
  if (m.includes("http 4") || m.includes("http 5")) {
    return "Your site returned an error when we tried to load it. Try again or check the URL.";
  }
  if (m.includes("anthropic") || m.includes("claude")) {
    return "Our analyzer had a hiccup. Try again in a moment.";
  }
  if (m.includes("timeout")) {
    return "The audit took too long. Try again in a moment.";
  }
  return "Something went wrong running your audit. Try again in a moment.";
}
