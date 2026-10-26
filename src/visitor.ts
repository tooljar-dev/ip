// Everything we know about the visitor, read from the request at the Cloudflare edge.
// Cloudflare sets CF-Connecting-IP itself (a client can't fake it) and fills request.cf
// with location and network data for that IP.

export interface Visitor {
  ip: string;
  version: 4 | 6;
  city: string | null;
  region: string | null;
  regionCode: string | null;
  /** Two-letter country code (ISO 3166-1), e.g. "GE". */
  country: string | null;
  countryName: string | null;
  continent: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  asn: number | null;
  /** The network that owns the IP, usually the internet provider (ISP). */
  org: string | null;
  isEU: boolean;
  /** Code of the Cloudflare data center that answered, e.g. "TBS". */
  colo: string | null;
  httpProtocol: string | null;
  tlsVersion: string | null;
  userAgent: string;
}

type CfData = Partial<Record<string, unknown>>;

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

let regionNames: Intl.DisplayNames | null = null;

export function countryName(code: string | null): string | null {
  if (!code) return null;
  // Cloudflare's special codes: T1 = Tor network, XX = unknown.
  if (code === "T1") return "Tor network";
  if (!/^[A-Z]{2}$/.test(code) || code === "XX") return null;
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    const name = regionNames.of(code);
    return name && name !== code ? name : null;
  } catch {
    return null;
  }
}

export function readVisitor(request: Request): Visitor {
  const cf = (request.cf ?? {}) as CfData;
  const ip = request.headers.get("cf-connecting-ip")?.trim() || "127.0.0.1";
  const rawCountry = str(cf.country)?.toUpperCase() ?? null;
  const country = rawCountry === "XX" ? null : rawCountry;
  return {
    ip,
    version: ip.includes(":") ? 6 : 4,
    city: str(cf.city),
    region: str(cf.region),
    regionCode: str(cf.regionCode),
    country,
    countryName: countryName(country),
    continent: str(cf.continent),
    postalCode: str(cf.postalCode),
    latitude: num(cf.latitude),
    longitude: num(cf.longitude),
    timezone: str(cf.timezone),
    asn: num(cf.asn),
    org: str(cf.asOrganization),
    isEU: cf.isEUCountry === "1" || cf.isEUCountry === true,
    colo: str(cf.colo),
    httpProtocol: str(cf.httpProtocol),
    tlsVersion: str(cf.tlsVersion),
    userAgent: request.headers.get("user-agent") ?? "",
  };
}

/** "Tbilisi, Tbilisi, Georgia": the place parts we have, without repeats. */
export function placeLine(v: Visitor): string | null {
  const parts: string[] = [];
  for (const part of [v.city, v.region, v.countryName ?? v.country]) {
    if (part && !parts.includes(part)) parts.push(part);
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

/** The JSON shape of the public API. Field names are stable: we may add fields, never rename. */
export function toJson(v: Visitor, hostname: string | null) {
  return {
    ip: v.ip,
    version: v.version,
    hostname,
    city: v.city,
    region: v.region,
    region_code: v.regionCode,
    country: v.country,
    country_name: v.countryName,
    continent: v.continent,
    postal_code: v.postalCode,
    latitude: v.latitude,
    longitude: v.longitude,
    timezone: v.timezone,
    asn: v.asn,
    org: v.org,
    is_eu: v.isEU,
    user_agent: v.userAgent || null,
  };
}
