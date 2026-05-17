import { NextResponse } from "next/server";
import {
  SALES_SOURCES,
  TRANSACTION_VALUES,
  TRANSACTION_VOLUMES,
  WEBSITE_GOALS,
  isValidEmail,
  type LeadPayload,
} from "@/lib/lead";
import { getCachedAnalysis, hashUrl, setCachedAnalysis } from "@/lib/cache";
import { validateAndNormalizeUrl } from "@/lib/url";
import { appendLeadRow } from "@/lib/sheets";
import {
  sendAuditLeadEmail,
  sendManualAuditNoticeToSusan,
  sendManualAuditNoticeToUser,
  sendUserAuditEmail,
} from "@/lib/email";
import type { AnalysisResult } from "@/lib/types";
import { SCHEMA_VERSION } from "@/lib/types";

export const maxDuration = 30;

const salesSourceValues = new Set(SALES_SOURCES.map((o) => o.value));
const websiteGoalValues = new Set(WEBSITE_GOALS.map((o) => o.value));
const transactionVolumeValues = new Set(TRANSACTION_VOLUMES.map((o) => o.value));
const transactionValueValues = new Set(TRANSACTION_VALUES.map((o) => o.value));

function originFromRequest(req: Request): string | null {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return host ? `${proto}://${host}` : null;
}

type LeadRequestBody = Partial<LeadPayload> & {
  analysis?: AnalysisResult;
  analysisError?: string;
};

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.hash === "string" &&
    typeof v.url === "string" &&
    typeof v.score === "number" &&
    Array.isArray(v.questions) &&
    typeof v.era === "object" &&
    v.era !== null &&
    v.version === SCHEMA_VERSION
  );
}

export async function POST(req: Request) {
  let body: LeadRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim();
  const validation = validateAndNormalizeUrl((body.url ?? "").toString());

  if (!name) return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  if (!validation.ok) return NextResponse.json({ ok: false, error: validation.reason }, { status: 400 });
  if (!body.salesSource || !salesSourceValues.has(body.salesSource)) {
    return NextResponse.json({ ok: false, error: "Invalid salesSource" }, { status: 400 });
  }
  if (!Array.isArray(body.websiteGoals) || body.websiteGoals.length === 0) {
    return NextResponse.json({ ok: false, error: "Pick at least one website goal" }, { status: 400 });
  }
  if (!body.websiteGoals.every((g) => websiteGoalValues.has(g))) {
    return NextResponse.json({ ok: false, error: "Invalid websiteGoals" }, { status: 400 });
  }
  if (!body.transactionVolume || !transactionVolumeValues.has(body.transactionVolume)) {
    return NextResponse.json({ ok: false, error: "Invalid transactionVolume" }, { status: 400 });
  }
  if (!body.transactionValue || !transactionValueValues.has(body.transactionValue)) {
    return NextResponse.json({ ok: false, error: "Invalid transactionValue" }, { status: 400 });
  }

  const lead: LeadPayload = {
    name,
    email,
    url: validation.normalized,
    salesSource: body.salesSource,
    websiteGoals: Array.from(new Set(body.websiteGoals)),
    transactionVolume: body.transactionVolume,
    transactionValue: body.transactionValue,
  };

  const hash = hashUrl(lead.url);

  // Prefer the analysis result sent inline (fresh from /api/analyze). Fall back
  // to the cache so old clients and re-sends still work.
  let analysis: AnalysisResult | null = null;
  if (isAnalysisResult(body.analysis) && body.analysis.hash === hash) {
    analysis = body.analysis;
    // Best-effort: refresh the cache in case the original write was lost.
    setCachedAnalysis(analysis).catch((err) => {
      console.warn("[lead] cache refresh failed:", err);
    });
  } else {
    analysis = await getCachedAnalysis(hash).catch(() => null);
  }

  const origin = originFromRequest(req);
  const publicUrl = analysis && origin ? `${origin}/results/${hash}` : null;

  const analysisError =
    typeof body.analysisError === "string" && body.analysisError.trim()
      ? body.analysisError.trim().slice(0, 500)
      : null;

  const manualMode = !analysis && analysisError !== null;

  const [sheetsResult, susanEmailResult, userEmailResult] = await Promise.allSettled([
    appendLeadRow({
      lead,
      analysis,
      manualNote: manualMode ? `MANUAL AUDIT NEEDED — ${analysisError}` : null,
    }),
    manualMode
      ? sendManualAuditNoticeToSusan({ lead, analysisError: analysisError! })
      : sendAuditLeadEmail({ lead, analysis, publicUrl }),
    manualMode
      ? sendManualAuditNoticeToUser({ lead })
      : analysis
      ? sendUserAuditEmail({ lead, analysis, publicUrl })
      : Promise.resolve(),
  ]);

  if (sheetsResult.status === "rejected") {
    console.error("[lead] Sheets append failed:", sheetsResult.reason);
  }
  if (susanEmailResult.status === "rejected") {
    console.error("[lead] Susan email failed:", susanEmailResult.reason);
  }
  if (userEmailResult.status === "rejected") {
    console.error("[lead] User email failed:", userEmailResult.reason);
  }

  return NextResponse.json({
    ok: true,
    manual: manualMode,
    integrations: {
      sheets: sheetsResult.status === "fulfilled",
      susanEmail: susanEmailResult.status === "fulfilled",
      userEmail: userEmailResult.status === "fulfilled",
    },
  });
}
