export type PageSpeedSummary = {
  performance: number | null;
  lcpMs: number | null;
  clsValue: number | null;
  fidMs: number | null;
  hasViewportMeta: boolean | null;
};

type PageSpeedResponse = {
  lighthouseResult?: {
    categories?: {
      performance?: { score?: number | null };
    };
    audits?: Record<
      string,
      { numericValue?: number; details?: unknown; score?: number | null }
    >;
  };
};

/**
 * Pull a tiny summary of PageSpeed mobile metrics. Mobile is what matters most
 * for the Hub Solutions UX framework (question 5: mobile PSI >= 80).
 */
export async function fetchPageSpeed(url: string): Promise<PageSpeedSummary> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
    category: "performance",
  });
  if (apiKey) params.set("key", apiKey);

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  const res = await fetch(endpoint, { method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PageSpeed failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as PageSpeedResponse;

  const performance =
    json.lighthouseResult?.categories?.performance?.score ?? null;
  const audits = json.lighthouseResult?.audits ?? {};
  const lcpMs = audits["largest-contentful-paint"]?.numericValue ?? null;
  const clsValue =
    audits["cumulative-layout-shift"]?.numericValue ?? null;
  const fidMs = audits["max-potential-fid"]?.numericValue ?? null;
  const hasViewportMeta =
    audits.viewport?.score === null ? null : audits.viewport?.score === 1;

  return {
    performance: performance === null ? null : Math.round(performance * 100),
    lcpMs: lcpMs === null ? null : Math.round(lcpMs),
    clsValue,
    fidMs: fidMs === null ? null : Math.round(fidMs),
    hasViewportMeta: hasViewportMeta ?? null,
  };
}
