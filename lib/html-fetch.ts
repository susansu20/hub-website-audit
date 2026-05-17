export type HtmlSignals = {
  title: string | null;
  description: string | null;
  generator: string | null;
  viewport: string | null;
  hasViewportMeta: boolean;
  hasFlash: boolean;
  hasFrameset: boolean;
  hasJquery: boolean;
  hasTailwind: boolean;
  hasGoogleFonts: boolean;
  hasDarkModeMedia: boolean;
  navLinkCount: number;
  imgCount: number;
  fontFaceFamilies: string[];
  topLevelLinks: string[];
  rawExcerpt: string;
};

const STRIP_LIMIT = 6000;

function pickMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return m[1] ?? null;
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] ?? null : null;
}

function pickTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}

function pickViewportMeta(html: string): string | null {
  const m = html.match(
    /<meta[^>]+name=["']viewport["'][^>]*content=["']([^"']*)["']/i
  );
  return m ? m[1] : null;
}

function pickFontFaceFamilies(html: string): string[] {
  const families = new Set<string>();
  const reFontFace = /@font-face\s*\{[^}]*font-family\s*:\s*["']?([^;"']+)["']?/gi;
  for (const m of Array.from(html.matchAll(reFontFace))) {
    families.add(m[1].trim());
  }
  const reGFonts = /fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/g;
  for (const m of Array.from(html.matchAll(reGFonts))) {
    families.add(decodeURIComponent(m[1].split(":")[0].replace(/\+/g, " ")));
  }
  return Array.from(families).slice(0, 10);
}

function pickTopLevelLinks(html: string): string[] {
  const links: string[] = [];
  const reHeader = /<header[\s\S]*?<\/header>/i;
  const reNav = /<nav[\s\S]*?<\/nav>/i;
  const headerSection =
    html.match(reHeader)?.[0] ?? html.match(reNav)?.[0] ?? "";
  const reAnchor = /<a[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of Array.from(headerSection.matchAll(reAnchor))) {
    const text = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text && text.length < 40) links.push(text);
    if (links.length >= 12) break;
  }
  return links;
}

export async function fetchHtmlSignals(url: string): Promise<HtmlSignals> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 HubSolutionsAuditBot/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    throw new Error(
      `Could not fetch HTML: ${err instanceof Error ? err.message : "unknown"}`
    );
  }
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`Site returned HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("html")) {
    throw new Error("Site did not return HTML");
  }

  const html = await res.text();
  const viewport = pickViewportMeta(html);

  const lower = html.toLowerCase();

  const signals: HtmlSignals = {
    title: pickTitle(html),
    description: pickMeta(html, "description"),
    generator: pickMeta(html, "generator"),
    viewport,
    hasViewportMeta: Boolean(viewport),
    hasFlash:
      lower.includes("<embed") && lower.includes("application/x-shockwave-flash"),
    hasFrameset: /<frameset[\s>]/i.test(html),
    hasJquery: /jquery[.\-][\d.]+(?:\.min)?\.js/i.test(html),
    hasTailwind:
      /\btw-/.test(html) ||
      /tailwind/i.test(html) ||
      /class=["'][^"']*\b(?:flex|grid|rounded-(?:xl|2xl|3xl)|backdrop-)/i.test(
        html
      ),
    hasGoogleFonts: /fonts\.googleapis\.com\/css/i.test(html),
    hasDarkModeMedia: /prefers-color-scheme:\s*dark/i.test(html),
    navLinkCount: (html.match(/<a\b/gi) ?? []).length,
    imgCount: (html.match(/<img\b/gi) ?? []).length,
    fontFaceFamilies: pickFontFaceFamilies(html),
    topLevelLinks: pickTopLevelLinks(html),
    rawExcerpt: html.slice(0, STRIP_LIMIT),
  };

  return signals;
}
