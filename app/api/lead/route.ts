import { NextResponse } from "next/server";
import {
  SALES_SOURCES,
  TRANSACTION_VALUES,
  TRANSACTION_VOLUMES,
  WEBSITE_GOALS,
  isValidEmail,
  type LeadPayload,
} from "@/lib/lead";
import { getCachedAnalysis, hashUrl } from "@/lib/cache";
import { validateAndNormalizeUrl } from "@/lib/url";
import { appendLeadRow } from "@/lib/sheets";
import { sendAuditLeadEmail } from "@/lib/email";

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

export async function POST(req: Request) {
  let body: Partial<LeadPayload>;
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
  if (!body.websiteGoal || !websiteGoalValues.has(body.websiteGoal)) {
    return NextResponse.json({ ok: false, error: "Invalid websiteGoal" }, { status: 400 });
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
    websiteGoal: body.websiteGoal,
    transactionVolume: body.transactionVolume,
    transactionValue: body.transactionValue,
  };

  const hash = hashUrl(lead.url);
  const analysis = await getCachedAnalysis(hash).catch(() => null);

  const origin = originFromRequest(req);
  const publicUrl = origin ? `${origin}/results/${hash}` : null;

  // Fire both writes in parallel — either failing should not block the user.
  const [sheetsResult, emailResult] = await Promise.allSettled([
    appendLeadRow({ lead, analysis }),
    sendAuditLeadEmail({ lead, analysis, publicUrl }),
  ]);

  if (sheetsResult.status === "rejected") {
    console.error("[lead] Sheets append failed:", sheetsResult.reason);
  }
  if (emailResult.status === "rejected") {
    console.error("[lead] Resend email failed:", emailResult.reason);
  }

  return NextResponse.json({
    ok: true,
    integrations: {
      sheets: sheetsResult.status === "fulfilled",
      email: emailResult.status === "fulfilled",
    },
  });
}
