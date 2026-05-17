export type Viewport = "desktop" | "mobile";

const VIEWPORTS: Record<Viewport, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1500, 3500];

export class ScreenshotCaptureError extends Error {
  readonly viewport: Viewport;
  readonly status?: number;
  constructor(viewport: Viewport, message: string, status?: number) {
    super(message);
    this.name = "ScreenshotCaptureError";
    this.viewport = viewport;
    this.status = status;
  }
}

/**
 * Capture a full-page screenshot via ScreenshotOne and return base64-encoded PNG.
 * Retries up to 3 times on transient 5xx or network failures.
 */
export async function captureScreenshot(
  url: string,
  viewport: Viewport
): Promise<string> {
  const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
  if (!accessKey) throw new Error("SCREENSHOTONE_ACCESS_KEY missing");

  const { width, height } = VIEWPORTS[viewport];
  const params = new URLSearchParams({
    access_key: accessKey,
    url,
    viewport_width: String(width),
    viewport_height: String(height),
    device_scale_factor: "1",
    format: "png",
    image_quality: "80",
    full_page: "true",
    full_page_scroll: "true",
    full_page_max_height: "4000",
    block_ads: "true",
    block_cookie_banners: "true",
    block_trackers: "true",
    cache: "false",
    timeout: "60",
    delay: "2",
  });

  const apiUrl = `https://api.screenshotone.com/take?${params.toString()}`;

  let lastError: ScreenshotCaptureError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(apiUrl, { method: "GET" });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        return buffer.toString("base64");
      }

      // 4xx is non-retriable (bad URL, blocked site, invalid key, etc.)
      if (res.status >= 400 && res.status < 500) {
        const body = await res.text();
        throw new ScreenshotCaptureError(
          viewport,
          friendlyMessageFor(res.status, body),
          res.status
        );
      }

      // 5xx: transient — record and retry
      lastError = new ScreenshotCaptureError(
        viewport,
        `Screenshot provider is having trouble (HTTP ${res.status}).`,
        res.status
      );
    } catch (err) {
      if (err instanceof ScreenshotCaptureError && err.status && err.status < 500) {
        throw err;
      }
      lastError = new ScreenshotCaptureError(
        viewport,
        err instanceof Error
          ? `Network issue capturing screenshot: ${err.message}`
          : "Network issue capturing screenshot."
      );
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 2000);
    }
  }

  throw lastError ?? new ScreenshotCaptureError(viewport, "Screenshot capture failed.");
}

function friendlyMessageFor(status: number, body: string): string {
  const text = body.toLowerCase();
  if (text.includes("access_key_invalid")) {
    return "Screenshot service is not configured correctly.";
  }
  if (status === 408 || text.includes("timeout")) {
    return "The site took too long to load. Try again in a moment.";
  }
  if (status === 403 || text.includes("blocked") || text.includes("forbidden")) {
    return "The site is blocking automated capture. Try a different URL.";
  }
  return `Screenshot failed (HTTP ${status}).`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
