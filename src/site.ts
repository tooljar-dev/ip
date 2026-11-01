// Facts about the site, kept in one place.
export const SITE = {
  host: "ip.tooljar.dev",
  origin: "https://ip.tooljar.dev",
  name: "tooljar IP",
  repo: "https://github.com/tooljar-dev/ip",
  // The day the page texts last changed. Used as <lastmod> in the sitemap, so keep it honest.
  updated: "2026-11-01",
} as const;

export interface Env {
  ASSETS: Fetcher;
  ANALYTICS_TOKEN: string;
}
