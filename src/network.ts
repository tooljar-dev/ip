// A rough guess at what kind of network an IP belongs to, from the owner's name.
// It can't be sure: some VPNs use home addresses, and some hosting names are unusual.
// The VPN check page says this in plain words.

const HOSTING =
  /\b(hosting|cloud|data ?cent(?:er|re)|datacamp|servers?|vps|colocation|digitalocean|amazon|aws|google llc|google cloud|microsoft|azure|oracle|ovh|hetzner|linode|akamai|fastly|cloudflare|m247|leaseweb|choopa|vultr|contabo|packethub|mullvad|proton|nordvpn|surfshark|expressvpn|private internet access|31173|xtom|tefincom|zenlayer|cdn77|hostinger|ionos|scaleway|alibaba|tencent|quadranet|psychz|frantech|g-core|gcore|stark industries|worldstream|netcup|vpn|proxy)\b/i;

export type NetworkKind = "hosting" | "isp" | "unknown";

export function networkKind(org: string | null): NetworkKind {
  if (!org) return "unknown";
  return HOSTING.test(org) ? "hosting" : "isp";
}
