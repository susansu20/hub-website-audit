import { Resend } from "resend";
import type { AnalysisResult, QuestionResult } from "./types";
import type { LeadPayload } from "./lead";
import {
  SALES_SOURCES,
  TRANSACTION_VALUES,
  TRANSACTION_VOLUMES,
  WEBSITE_GOALS,
} from "./lead";

let resend: Resend | null = null;
function getResend(): Resend {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  resend = new Resend(key);
  return resend;
}

function labelFor<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function questionRow(q: QuestionResult): string {
  const color =
    q.score === "YES" ? "#059669" : q.score === "NO" ? "#dc2626" : "#a16207";
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;width:60px;color:${color};font-weight:600;">${q.score}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;color:#475569;width:90px;">${escapeHtml(q.layer)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;">
        <div style="font-weight:600;color:#1B2A5E;">${escapeHtml(q.question)}</div>
        <div style="margin-top:4px;font-size:13px;color:#475569;">${escapeHtml(q.rationale)}</div>
      </td>
    </tr>
  `;
}

function buildAuditEmail(opts: {
  lead: LeadPayload;
  analysis: AnalysisResult | null;
  publicUrl: string | null;
}): string {
  const { lead, analysis, publicUrl } = opts;

  const summary = analysis
    ? `
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Audit summary</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:12px;background:#F5F2EC;border-radius:12px;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Era</div>
            <div style="margin-top:4px;font-size:18px;color:#1B2A5E;font-weight:600;">${escapeHtml(analysis.era.verdict)}</div>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:12px;background:#F5F2EC;border-radius:12px;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">UX score</div>
            <div style="margin-top:4px;font-size:18px;color:#1B2A5E;font-weight:600;">${analysis.score.toFixed(1)} / 10 · ${escapeHtml(analysis.bracketLabel)}</div>
            <div style="margin-top:4px;font-size:13px;color:#475569;">${escapeHtml(analysis.bracketVerdict)}</div>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:12px;background:#F5F2EC;border-radius:12px;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">90-day forecast</div>
            <div style="margin-top:4px;font-size:14px;color:#1B2A5E;">
              Current: ${analysis.forecast.current.low}–${analysis.forecast.current.high} leads<br>
              After revamp: ${analysis.forecast.potential.low}–${analysis.forecast.potential.high} leads
            </div>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">10-point breakdown</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:12px;overflow:hidden;margin-bottom:24px;">
        ${analysis.questions.map(questionRow).join("")}
      </table>
    `
    : `<p style="color:#dc2626;">Note: the audit analysis was not available when this lead came in.</p>`;

  const viewLink = publicUrl
    ? `<p><a href="${escapeHtml(publicUrl)}" style="color:#F7941D;">View full audit in browser →</a></p>`
    : "";

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F1419;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#1B2A5E;color:#fff;padding:20px 24px;border-radius:16px 16px 0 0;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#FFC72C;">New audit lead</div>
      <div style="margin-top:6px;font-size:22px;font-weight:600;">${escapeHtml(lead.name)} · ${analysis ? analysis.score.toFixed(1) + "/10 " + escapeHtml(analysis.bracketLabel) : "audit unavailable"}</div>
    </div>

    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;border:1px solid #eee;border-top:0;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Contact</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#64748b;width:140px;">Name</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#1B2A5E;">${escapeHtml(lead.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Website</td><td style="padding:6px 0;"><a href="${escapeHtml(lead.url)}" style="color:#1B2A5E;">${escapeHtml(lead.url)}</a></td></tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Qualifiers</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#64748b;width:200px;">Current sales source</td><td style="padding:6px 0;">${escapeHtml(labelFor(SALES_SOURCES, lead.salesSource))}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Website goal</td><td style="padding:6px 0;">${escapeHtml(labelFor(WEBSITE_GOALS, lead.websiteGoal))}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Transactions / month</td><td style="padding:6px 0;">${escapeHtml(labelFor(TRANSACTION_VOLUMES, lead.transactionVolume))}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Avg transaction value</td><td style="padding:6px 0;">${escapeHtml(labelFor(TRANSACTION_VALUES, lead.transactionValue))}</td></tr>
      </table>

      ${summary}
      ${viewLink}
    </div>

    <p style="margin:20px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
      Reply to this email to follow up. Sent by the Hub Solutions Audit tool.
    </p>
  </div>
</body>
</html>`;
}

export async function sendAuditLeadEmail(opts: {
  lead: LeadPayload;
  analysis: AnalysisResult | null;
  publicUrl: string | null;
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "audit@hubsolutions.one";
  const to = process.env.SUSAN_NOTIFICATION_EMAIL;
  if (!to) throw new Error("SUSAN_NOTIFICATION_EMAIL missing");

  const { lead, analysis } = opts;
  const subject = analysis
    ? `New Audit Lead: ${lead.name} · ${analysis.score.toFixed(1)}/10 (${analysis.bracketLabel})`
    : `New Audit Lead: ${lead.name}`;

  await getResend().emails.send({
    from,
    to,
    replyTo: lead.email,
    subject,
    html: buildAuditEmail(opts),
  });
}
