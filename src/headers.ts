// The request headers the visitor's browser sent, for the /headers page and API.
// We drop the headers Cloudflare adds on its way to us, and hide secret-like values.

const ADDED_BY_CLOUDFLARE = new Set([
  "cdn-loop",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-real-ip",
  "true-client-ip",
]);
const HIDDEN_VALUES = new Set(["cookie", "authorization", "proxy-authorization"]);

export function visibleHeaders(headers: Headers): [string, string][] {
  const out: [string, string][] = [];
  for (const [name, value] of headers) {
    if (name.startsWith("cf-") || ADDED_BY_CLOUDFLARE.has(name)) continue;
    out.push([name, HIDDEN_VALUES.has(name) ? `(hidden, ${value.length} characters)` : value]);
  }
  return out.sort(([a], [b]) => a.localeCompare(b));
}
