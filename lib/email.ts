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
        <tr><td style="padding:6px 0;color:#64748b;">Website goals</td><td style="padding:6px 0;">${escapeHtml(lead.websiteGoals.map((g) => labelFor(WEBSITE_GOALS, g)).join(", "))}</td></tr>
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

function buildUserAuditEmail(opts: {
  lead: LeadPayload;
  analysis: AnalysisResult;
  publicUrl: string | null;
  bookingUrl: string;
}): string {
  const { lead, analysis, publicUrl, bookingUrl } = opts;
  const firstName = lead.name.split(/\s+/)[0] ?? lead.name;

  const breakdownRows = analysis.questions
    .map((q) => questionRow(q))
    .join("");

  const viewLink = publicUrl
    ? `<p style="margin:0 0 16px;"><a href="${escapeHtml(publicUrl)}" style="color:#F7941D;font-weight:600;">View your audit in the browser →</a></p>`
    : "";

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F1419;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#1B2A5E;color:#fff;padding:24px;border-radius:16px 16px 0 0;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#FFC72C;">Your audit is ready</div>
      <div style="margin-top:8px;font-size:24px;font-weight:600;">Hi ${escapeHtml(firstName)}, here are your results.</div>
      <div style="margin-top:6px;font-size:14px;color:rgba(255,255,255,0.75);">For ${escapeHtml(analysis.host)}</div>
    </div>

    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;border:1px solid #eee;border-top:0;">
      ${viewLink}

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Era verdict</p>
      <div style="background:#1B2A5E;color:#fff;padding:16px;border-radius:12px;margin-bottom:16px;">
        <div style="font-size:34px;font-weight:700;color:#FFC72C;line-height:1;">${analysis.era.year}</div>
        <div style="margin-top:8px;font-size:16px;">${escapeHtml(analysis.era.verdict)}</div>
        <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.7);">${escapeHtml(analysis.era.reasoning)}</div>
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">UX score</p>
      <div style="background:#F5F2EC;padding:16px;border-radius:12px;margin-bottom:16px;">
        <div style="font-size:42px;font-weight:700;color:#1B2A5E;line-height:1;">${analysis.score.toFixed(1)}<span style="font-size:18px;color:#94a3b8;">/10</span></div>
        <div style="margin-top:6px;display:inline-block;background:#FFC72C;color:#1B2A5E;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;">${escapeHtml(analysis.bracketLabel)}</div>
        <div style="margin-top:8px;font-size:13px;color:#475569;">${escapeHtml(analysis.bracketVerdict)}</div>
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">90-day lead forecast</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="width:50%;padding-right:6px;vertical-align:top;">
            <div style="background:#F5F2EC;padding:14px;border-radius:12px;text-align:center;">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Current</div>
              <div style="margin-top:4px;font-size:24px;font-weight:700;color:#1B2A5E;">${analysis.forecast.current.low} – ${analysis.forecast.current.high}</div>
              <div style="font-size:11px;color:#64748b;">leads / 90 days</div>
            </div>
          </td>
          <td style="width:50%;padding-left:6px;vertical-align:top;">
            <div style="background:#1B2A5E;padding:14px;border-radius:12px;text-align:center;color:#fff;">
              <div style="font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em;">After revamp</div>
              <div style="margin-top:4px;font-size:24px;font-weight:700;color:#FFC72C;">${analysis.forecast.potential.low} – ${analysis.forecast.potential.high}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.7);">leads / 90 days</div>
            </div>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">10-point breakdown</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:12px;overflow:hidden;margin-bottom:24px;">
        ${breakdownRows}
      </table>

      <div style="background:#1B2A5E;color:#fff;padding:20px;border-radius:12px;text-align:center;">
        <div style="font-size:18px;font-weight:600;">Want me to walk you through the top fixes?</div>
        <div style="margin-top:6px;font-size:14px;color:rgba(255,255,255,0.75);">Book a free 15-minute strategy call. No obligation.</div>
        <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;margin-top:14px;background:#F7941D;color:#1B2A5E;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;">Book my strategy call</a>
      </div>
    </div>

    <p style="margin:16px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
      Forecast based on Hub Solutions&rsquo; anonymized client data across 50+ Singapore SME websites.
      Actual results depend on traffic, industry, and offer.
    </p>
    <p style="margin:8px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
      Hub Solutions Digital · Singapore
    </p>
  </div>
</body>
</html>`;
}

export async function sendUserAuditEmail(opts: {
  lead: LeadPayload;
  analysis: AnalysisResult;
  publicUrl: string | null;
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "audit@hubsolutions.one";
  const reply = process.env.SUSAN_NOTIFICATION_EMAIL;
  const bookingUrl = process.env.HUB_SOLUTIONS_BOOKING_URL ?? "https://hubsolutions.one";

  const { lead, analysis } = opts;
  const subject = `Your Hub Solutions audit · ${analysis.score.toFixed(1)}/10 (${analysis.bracketLabel})`;

  await getResend().emails.send({
    from,
    to: lead.email,
    replyTo: reply,
    subject,
    html: buildUserAuditEmail({ ...opts, bookingUrl }),
  });
}

// ---------------------------------------------------------------------------
// Manual-audit fallback emails (sent when automated analysis fails)
// ---------------------------------------------------------------------------

function buildManualSusanEmail(opts: {
  lead: LeadPayload;
  analysisError: string;
}): string {
  const { lead, analysisError } = opts;
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F1419;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#dc2626;color:#fff;padding:20px 24px;border-radius:16px 16px 0 0;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#fff;">Manual audit needed</div>
      <div style="margin-top:6px;font-size:22px;font-weight:600;">${escapeHtml(lead.name)} · automated audit failed</div>
    </div>

    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;border:1px solid #eee;border-top:0;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Reason</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:10px;font-size:13px;color:#991b1b;margin-bottom:20px;">
        ${escapeHtml(analysisError)}
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Contact</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#64748b;width:140px;">Name</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#1B2A5E;">${escapeHtml(lead.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Website</td><td style="padding:6px 0;"><a href="${escapeHtml(lead.url)}" style="color:#1B2A5E;">${escapeHtml(lead.url)}</a></td></tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Qualifiers</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#64748b;width:200px;">Current sales source</td><td style="padding:6px 0;">${escapeHtml(labelFor(SALES_SOURCES, lead.salesSource))}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Website goals</td><td style="padding:6px 0;">${escapeHtml(lead.websiteGoals.map((g) => labelFor(WEBSITE_GOALS, g)).join(", "))}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Transactions / month</td><td style="padding:6px 0;">${escapeHtml(labelFor(TRANSACTION_VOLUMES, lead.transactionVolume))}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Avg transaction value</td><td style="padding:6px 0;">${escapeHtml(labelFor(TRANSACTION_VALUES, lead.transactionValue))}</td></tr>
      </table>

      <p style="margin:0;font-size:13px;color:#64748b;">
        Visitor was told you would personally review their site and reply within 24 hours.
      </p>
    </div>

    <p style="margin:20px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
      Reply to this email to follow up. Sent by the Hub Solutions Audit tool.
    </p>
  </div>
</body>
</html>`;
}

function buildManualUserEmail(opts: {
  lead: LeadPayload;
  bookingUrl: string;
}): string {
  const { lead, bookingUrl } = opts;
  const firstName = lead.name.split(/\s+/)[0] ?? lead.name;
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F1419;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#1B2A5E;color:#fff;padding:24px;border-radius:16px 16px 0 0;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#FFC72C;">We&rsquo;re on it</div>
      <div style="margin-top:8px;font-size:24px;font-weight:600;">Hi ${escapeHtml(firstName)}, your audit needs a human touch.</div>
    </div>

    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;border:1px solid #eee;border-top:0;">
      <p style="margin:0 0 16px;">
        Our automated tool couldn&rsquo;t capture <strong>${escapeHtml(lead.url)}</strong>.
        That&rsquo;s usually a signal about how your site treats bots, not a problem with your business.
      </p>

      <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Common reasons</p>
      <ul style="margin:0 0 20px;padding-left:20px;color:#475569;font-size:14px;">
        <li style="margin-bottom:6px;"><strong>Bot protection</strong> (Cloudflare, anti-DDoS, or a strict WAF) blocked our crawler.</li>
        <li style="margin-bottom:6px;"><strong>Slow or busy server</strong> took longer than 60 seconds to render.</li>
        <li style="margin-bottom:6px;"><strong>Login or paywall</strong> sits in front of key pages.</li>
        <li style="margin-bottom:6px;"><strong>Heavy single-page app</strong> needs extra runtime to surface content.</li>
      </ul>

      <p style="margin:0 0 16px;">
        None of these are dealbreakers. Susan will personally review your site
        against the same 10-point framework and email you the full audit within 24 hours.
      </p>

      <div style="background:#1B2A5E;color:#fff;padding:20px;border-radius:12px;text-align:center;">
        <div style="font-size:18px;font-weight:600;">Want to skip the wait?</div>
        <div style="margin-top:6px;font-size:14px;color:rgba(255,255,255,0.75);">Book a 15-minute strategy call now and we&rsquo;ll walk through your site live.</div>
        <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;margin-top:14px;background:#F7941D;color:#1B2A5E;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;">Book my strategy call</a>
      </div>
    </div>

    <p style="margin:16px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
      Hub Solutions Digital · Singapore
    </p>
  </div>
</body>
</html>`;
}

export async function sendManualAuditNoticeToSusan(opts: {
  lead: LeadPayload;
  analysisError: string;
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "audit@hubsolutions.one";
  const to = process.env.SUSAN_NOTIFICATION_EMAIL;
  if (!to) throw new Error("SUSAN_NOTIFICATION_EMAIL missing");

  const subject = `MANUAL AUDIT NEEDED: ${opts.lead.name} · ${opts.lead.url}`;

  await getResend().emails.send({
    from,
    to,
    replyTo: opts.lead.email,
    subject,
    html: buildManualSusanEmail(opts),
  });
}

export async function sendManualAuditNoticeToUser(opts: {
  lead: LeadPayload;
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "audit@hubsolutions.one";
  const reply = process.env.SUSAN_NOTIFICATION_EMAIL;
  const bookingUrl =
    process.env.HUB_SOLUTIONS_BOOKING_URL ?? "https://hubsolutions.one";

  const subject = "We're manually auditing your site";

  await getResend().emails.send({
    from,
    to: opts.lead.email,
    replyTo: reply,
    subject,
    html: buildManualUserEmail({ lead: opts.lead, bookingUrl }),
  });
}
