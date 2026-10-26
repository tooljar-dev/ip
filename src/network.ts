// What kind of network an IP comes from. Tor is certain: Cloudflare marks Tor exits with the
// country code T1. Everything else is an estimate, checked in this order:
//   1. the network number (ASN) against the short lists below,
//   2. the owner's name (catches small hosting companies that aren't listed),
//   3. otherwise: a regular internet provider.
// Some VPNs use home addresses and some hosting names are unusual, so it can be wrong.
// The pages say "estimate" and the VPN check page explains why.

// Networks that carry privacy relays (iCloud Private Relay, Cloudflare WARP).
// Each number was checked against its registered owner (RIPEstat) on 2026-10-27.
const RELAY_ASNS: Record<number, string> = {
  13335: "Cloudflare",
  36183: "Akamai (iCloud Private Relay)",
  54113: "Fastly",
};

// Clouds, rented servers and VPN providers: networks where people rent machines, not
// home or mobile lines. Each number was checked against its registered owner (RIPEstat)
// on 2026-10-27. Add a network only after checking its owner the same way: a name alone
// can match an ordinary internet provider.
const HOSTING_ASNS: Record<number, string> = {
  // Big clouds
  16509: "Amazon",
  14618: "Amazon",
  8987: "Amazon",
  15169: "Google",
  19527: "Google",
  396982: "Google Cloud",
  8075: "Microsoft",
  31898: "Oracle",
  45102: "Alibaba",
  37963: "Alibaba",
  45090: "Tencent",
  132203: "Tencent",
  // Rented servers
  14061: "DigitalOcean",
  63949: "Akamai Connected Cloud (Linode)",
  20473: "Vultr",
  16276: "OVH",
  24940: "Hetzner",
  213230: "Hetzner Cloud",
  51167: "Contabo",
  40021: "Contabo",
  141995: "Contabo",
  12876: "Scaleway",
  60781: "Leaseweb",
  28753: "Leaseweb",
  30633: "Leaseweb",
  7203: "Leaseweb",
  59253: "Leaseweb",
  32613: "Leaseweb Canada (iWeb)",
  47583: "Hostinger",
  8560: "IONOS",
  197540: "netcup",
  49981: "WorldStream",
  36352: "ColoCrossing",
  40676: "Psychz",
  53667: "FranTech (BuyVM)",
  62240: "Clouvider",
  199524: "G-Core Labs",
  46606: "Unified Layer",
  26496: "GoDaddy",
  32244: "Liquid Web",
  21859: "Zenlayer",
  3214: "xTom",
  202425: "IP Volume",
  210644: "Aeza",
  9123: "Timeweb",
  57043: "HOSTKEY",
  35916: "Multacom",
  396356: "Latitude.sh",
  54290: "Hostwinds",
  29802: "Hivelocity",
  61317: "Hivelocity",
  55286: "ServerMania",
  23470: "ReliableSite",
  63473: "HostHatch",
  7979: "Servers.com",
  20860: "iomart",
  // VPN providers and the server companies most VPNs rent from
  9009: "M247",
  60068: "Datacamp (CDN77)",
  212238: "Datacamp (CDN77)",
  136787: "PacketHub",
  147049: "PacketHub",
  39351: "31173 Services",
  62371: "Proton",
  209103: "Proton VPN",
  199218: "Proton VPN",
  216025: "Mullvad VPN",
};

// Owner names that point to hosting or VPN networks missing from the list above.
const HOSTING_NAME =
  /\b(hosting|cloud|data ?cent(?:er|re)|datacamp|servers?|vps|colocation|digitalocean|amazon|aws|google llc|google cloud|microsoft|azure|oracle|ovh|hetzner|linode|akamai|fastly|cloudflare|m247|leaseweb|choopa|vultr|contabo|packethub|mullvad|proton|nordvpn|surfshark|expressvpn|private internet access|31173|xtom|tefincom|zenlayer|cdn77|hostinger|ionos|scaleway|alibaba|tencent|quadranet|psychz|frantech|g-core|gcore|stark industries|worldstream|netcup|vpn|proxy)\b/i;

export type NetworkKind = "tor" | "relay" | "hosting" | "isp" | "unknown";

export function networkKind(n: {
  country: string | null;
  asn: number | null;
  org: string | null;
}): NetworkKind {
  if (n.country === "T1") return "tor";
  if (n.asn !== null && n.asn in RELAY_ASNS) return "relay";
  if (n.asn !== null && n.asn in HOSTING_ASNS) return "hosting";
  if (n.org && HOSTING_NAME.test(n.org)) return "hosting";
  return n.org || n.asn !== null ? "isp" : "unknown";
}

/** Short words for the pages and the support summary. */
export const NETWORK_LABEL: Record<NetworkKind, string> = {
  tor: "Tor network",
  relay: "Privacy relay (estimate), like iCloud Private Relay or Cloudflare WARP",
  hosting: "Hosting or VPN network (estimate)",
  isp: "Regular internet provider (estimate)",
  unknown: "Not known",
};
