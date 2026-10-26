// Files for search engines and AI tools: robots.txt, sitemap.xml, llms.txt, security.txt.
import { SITE } from "./site";

/** Every public page, in the order the sitemap lists them. */
export const PAGE_PATHS = [
  "/",
  "/ipv6",
  "/location",
  "/vpn-check",
  "/public-vs-private-ip",
  "/headers",
  "/api",
  "/privacy",
] as const;

export function robotsTxt(): string {
  return `# tooljar IP: every crawler is welcome, AI crawlers included.
User-agent: *
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`;
}

export function sitemapXml(): string {
  const urls = PAGE_PATHS.map(
    (path) => `  <url><loc>${SITE.origin}${path}</loc><lastmod>${SITE.updated}</lastmod></url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function llmsTxt(): string {
  const o = SITE.origin;
  return `# tooljar IP

> Free "what is my IP" website and API. It shows the caller's public IP address (IPv4 or IPv6), rough location, network (ASN and owner), reverse DNS hostname and user agent. No key, no sign-up, CORS enabled, free for commercial use.

The API only answers about the IP that calls it. It can't look up other IP addresses. An AI agent that runs on a server sees the server's IP, not its user's.

## API

- [Plain-text IP](${o}/ip): \`curl ${SITE.host}\` prints only the IP and a new line.
- [JSON](${o}/json): fields ip, version, hostname, city, region, region_code, country, country_name, continent, postal_code, latitude, longitude, timezone, asn, org, network_type, is_tor, is_eu, user_agent. Unknown values are null. network_type is "isp", "hosting", "relay" or "tor"; only "tor" is certain, the rest is an estimate.
- Single fields as plain text: ${o}/city, /region, /country, /postal, /loc, /timezone, /asn, /org, /hostname, /ua (404 with an empty body when unknown).
- [Request headers](${o}/headers): JSON for scripts, a web page for browsers.
- [API documentation](${o}/api)
- Fair use: up to 50 requests in 10 seconds per IP, then HTTP 429 for 10 seconds. For steady use, about one request a second or less; monitors every 5 minutes or slower. Free for commercial use, no uptime promise.

## Guides

- [What is my IPv6 address?](${o}/ipv6)
- [What is my IP location?](${o}/location)
- [Am I using a VPN? (VPN and WebRTC leak check)](${o}/vpn-check)
- [Public vs private IP address](${o}/public-vs-private-ip)

## Source

- [Source code (MIT license)](${SITE.repo})
- [Privacy](${o}/privacy): no logs, no cookies, no ads.
`;
}

export function securityTxt(): string {
  return `Contact: ${SITE.repo}/security/advisories/new
Expires: 2027-10-25T00:00:00.000Z
Preferred-Languages: en
Canonical: ${SITE.origin}/.well-known/security.txt
`;
}
