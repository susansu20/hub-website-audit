export type Viewport = "desktop" | "mobile";

const VIEWPORTS: Record<Viewport, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

/**
 * Capture a full-page screenshot via ScreenshotOne and return base64-encoded PNG.
 * Used as input to Claude's vision API.
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

  const res = await fetch(apiUrl, { method: "GET" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `ScreenshotOne failed (${res.status}) for ${viewport}: ${body.slice(0, 200)}`
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString("base64");
}
