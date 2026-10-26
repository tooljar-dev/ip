// Reverse DNS: the hostname (name) that an IP address points back to, if its owner set one.
// We ask Cloudflare's public resolver over HTTPS (DNS over HTTPS), with a short time limit.

export function parseIPv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const bytes = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  return bytes.every((b) => b >= 0 && b <= 255) ? bytes : null;
}

/** Writes an IPv6 address out in full: 32 hex digits, no colons. Null if it isn't valid. */
export function expandIPv6(input: string): string | null {
  let ip = input.toLowerCase();
  // An IPv4 address at the end ("::ffff:192.0.2.1") becomes two hex groups.
  const v4 = ip.match(/(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4?.[1]) {
    const b = parseIPv4(v4[1]);
    if (!b) return null;
    const [b0 = 0, b1 = 0, b2 = 0, b3 = 0] = b;
    ip = `${ip.slice(0, -v4[1].length)}${((b0 << 8) | b1).toString(16)}:${((b2 << 8) | b3).toString(16)}`;
  }
  const halves = ip.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => g.padStart(4, "0")).join("");
}

/** The DNS name to look up for an IP: "4.3.2.1.in-addr.arpa" or the IPv6 "nibble" form. */
export function ptrName(ip: string): string | null {
  const v4 = parseIPv4(ip);
  if (v4) return `${v4.reverse().join(".")}.in-addr.arpa`;
  const v6 = expandIPv6(ip);
  if (v6) return `${v6.split("").reverse().join(".")}.ip6.arpa`;
  return null;
}

interface DohAnswer {
  Answer?: { type: number; data: string }[];
}

export async function reverseDns(
  ip: string,
  timeoutMs: number,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const name = ptrName(ip);
  if (!name) return null;
  try {
    const res = await fetcher(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=PTR`,
      { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(timeoutMs) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as DohAnswer;
    const host = data.Answer?.find((a) => a.type === 12)?.data?.replace(/\.$/, "");
    return host && /^[a-z0-9_.-]{1,253}$/i.test(host) ? host.toLowerCase() : null;
  } catch {
    return null;
  }
}
