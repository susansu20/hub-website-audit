import { google } from "googleapis";
import type { AnalysisResult } from "./types";
import type { LeadPayload } from "./lead";

function loadCredentials(): { client_email: string; private_key: string } {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !key) throw new Error("Google service account env missing");
  return {
    client_email: email,
    private_key: key.replace(/\\n/g, "\n"),
  };
}

function getSheetsClient() {
  const creds = loadCredentials();
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function topFailedQuestions(result: AnalysisResult | null): string {
  if (!result) return "";
  const failed = result.questions
    .filter((q) => q.score !== "YES")
    .sort((a, b) => (a.score === "NO" && b.score !== "NO" ? -1 : 1))
    .slice(0, 3)
    .map((q) => `Q${q.id} (${q.score}): ${q.question}`);
  return failed.join(" | ");
}

export async function appendLeadRow(opts: {
  lead: LeadPayload;
  analysis: AnalysisResult | null;
}): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEETS_ID missing");

  const { lead, analysis } = opts;
  const now = new Date().toISOString();

  const row = [
    now,
    lead.name,
    lead.email,
    lead.url,
    analysis ? analysis.score.toFixed(1) : "",
    analysis ? analysis.era.verdict : "",
    analysis ? analysis.bracketLabel : "",
    lead.salesSource,
    lead.websiteGoals.join(", "),
    lead.transactionVolume,
    lead.transactionValue,
    analysis ? `${analysis.forecast.current.low}-${analysis.forecast.current.high}` : "",
    analysis ? `${analysis.forecast.potential.low}-${analysis.forecast.potential.high}` : "",
    topFailedQuestions(analysis),
  ];

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "A:N",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}
