export type UrlValidation =
  | { ok: true; normalized: string }
  | { ok: false; reason: string };

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

const PRIVATE_IP_PREFIXES = ["10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."];

export function validateAndNormalizeUrl(input: string): UrlValidation {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: "Paste a URL to get started." };

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { ok: false, reason: "That doesn't look like a valid URL." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "URL must start with http:// or https://" };
  }

  const host = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTS.has(host)) {
    return { ok: false, reason: "We can only audit publicly accessible websites." };
  }

  if (PRIVATE_IP_PREFIXES.some((p) => host.startsWith(p))) {
    return { ok: false, reason: "We can only audit publicly accessible websites." };
  }

  if (!host.includes(".")) {
    return { ok: false, reason: "That hostname doesn't look right." };
  }

  parsed.hash = "";
  parsed.username = "";
  parsed.password = "";

  return { ok: true, normalized: parsed.toString() };
}
