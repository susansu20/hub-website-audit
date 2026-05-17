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
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("[analyze] failed:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 502 }
    );
  }
}
