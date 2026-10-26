import { exports } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PAGE_PATHS } from "../src/seo";

const BROWSER = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};
const CURL = { accept: "*/*", "user-agent": "curl/8.22.0" };

const TBILISI = {
  city: "Tbilisi",
  region: "Tbilisi",
  regionCode: "TB",
  country: "GE",
  continent: "AS",
  postalCode: "0100",
  latitude: "41.69140",
  longitude: "44.83410",
  timezone: "Asia/Tbilisi",
  asn: 35805,
  asOrganization: "JSC Silknet",
  isEUCountry: undefined,
  colo: "TBS",
  httpProtocol: "HTTP/2",
  tlsVersion: "TLSv1.3",
};

interface CallOptions {
  headers?: Record<string, string>;
  ip?: string;
  cf?: Record<string, unknown>;
  method?: string;
  origin?: string;
}

function call(path: string, options: CallOptions = {}): Promise<Response> {
  const { headers = CURL, ip = "176.221.158.188", cf = TBILISI, method = "GET" } = options;
  const origin = options.origin ?? "https://ip.tooljar.dev";
  return exports.default.fetch(
    new Request(`${origin}${path}`, {
      method,
      redirect: "manual",
      headers: { "cf-connecting-ip": ip, ...headers },
      cf,
    }),
  );
}

/** Makes the reverse DNS lookup (DNS over HTTPS) answer with this name, or fail. */
function mockDns(name: string | null) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith("https://cloudflare-dns.com/")) throw new Error(`unexpected fetch ${url}`);
    if (name === null) throw new Error("DNS down");
    return Response.json({ Answer: [{ type: 12, data: `${name}.` }] });
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the home address", () => {
  it("gives curl the bare IP", async () => {
    const res = await call("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("176.221.158.188\n");
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("vary")).toBe("Accept, User-Agent");
  });

  it("gives browsers the page, with the IP in the HTML", async () => {
    const res = await call("/", { headers: BROWSER });
    const body = await res.text();
    expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(res.headers.get("content-security-policy")).toContain("default-src 'none'");
    expect(body).toContain('<p class="ip" id="ip">176.221.158.188</p>');
    expect(body).toContain("Tbilisi, Georgia");
    expect(body).toContain("JSC Silknet");
    expect(body).toContain("Chrome 141 on Windows");
    expect(body).toContain('data-other-ip="6"');
    expect(body).toContain('<link rel="canonical" href="https://ip.tooljar.dev/">');
  });

  it("answers in JSON when asked", async () => {
    mockDns("host.silknet.example");
    const res = await call("/", { headers: { accept: "application/json" } });
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.ip).toBe("176.221.158.188");
    expect(data.hostname).toBe("host.silknet.example");
  });

  it("offers a support summary, the calm promise and a map dot", async () => {
    const body = await (await call("/", { headers: BROWSER })).text();
    const report = body.match(/data-copy="([^"]*)" data-report/)?.[1] ?? "";
    expect(report).toContain("IP address: 176.221.158.188 (IPv4)");
    expect(report).toContain("IPv6: checking…");
    expect(report).toContain("Internet provider: JSC Silknet (AS35805)");
    expect(report).toContain("Approximate location: Tbilisi, Georgia");
    expect(report).toContain("Network type: Regular internet provider (estimate)");
    expect(report).toContain("Browser: Chrome 141 on Windows");
    expect(body).toContain("<span>No VPN sales</span>");
    // Tbilisi (44.83 E, 41.69 N) on the 360 × 150 map: left 62.5 %, top 28.9 %.
    expect(body).toContain('src="/world.svg"');
    expect(body).toContain('style="left:62.5%;top:28.9%"');
  });

  it("leaves the map out when there are no coordinates", async () => {
    const body = await (await call("/", { headers: BROWSER, cf: {} })).text();
    expect(body).not.toContain("world.svg");
    expect(body).toContain('<section class="hero" aria-label="Your public IP address">');
  });

  it("shows IPv6 visitors their IPv6 and checks for IPv4", async () => {
    const body = await (await call("/", { headers: BROWSER, ip: "2001:db8::1" })).text();
    expect(body).toContain('<p class="ip v6" id="ip">2001:db8::1</p>');
    expect(body).toContain('data-other-ip="4"');
  });

  it("escapes a hostile user agent", async () => {
    const evil = '<script>alert("x")</script>';
    const body = await (await call("/", { headers: { ...BROWSER, "user-agent": evil } })).text();
    expect(body).not.toContain(evil);
    expect(body).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });
});

describe("the API", () => {
  it("returns every field as JSON", async () => {
    mockDns("host.silknet.example");
    const res = await call("/json");
    expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
    expect(await res.json()).toEqual({
      ip: "176.221.158.188",
      version: 4,
      hostname: "host.silknet.example",
      city: "Tbilisi",
      region: "Tbilisi",
      region_code: "TB",
      country: "GE",
      country_name: "Georgia",
      continent: "AS",
      postal_code: "0100",
      latitude: 41.6914,
      longitude: 44.8341,
      timezone: "Asia/Tbilisi",
      asn: 35805,
      org: "JSC Silknet",
      network_type: "isp",
      is_tor: false,
      is_eu: false,
      user_agent: "curl/8.22.0",
    });
  });

  it("marks Tor exits for sure and other networks by type", async () => {
    mockDns(null);
    const tor = (await (
      await call("/json", { cf: { ...TBILISI, country: "T1", asn: 24940 } })
    ).json()) as Record<string, unknown>;
    expect(tor.is_tor).toBe(true);
    expect(tor.network_type).toBe("tor");
    expect(tor.country_name).toBe("Tor network");
    const vpn = (await (
      await call("/json", { cf: { ...TBILISI, asn: 9009, asOrganization: "M247 Europe SRL" } })
    ).json()) as Record<string, unknown>;
    expect(vpn.network_type).toBe("hosting");
    expect(vpn.is_tor).toBe(false);
    const empty = (await (await call("/json", { cf: {} })).json()) as Record<string, unknown>;
    expect(empty.network_type).toBeNull();
  });

  it("still answers when reverse DNS fails", async () => {
    mockDns(null);
    const data = (await (await call("/json")).json()) as Record<string, unknown>;
    expect(data.hostname).toBeNull();
    expect(data.ip).toBe("176.221.158.188");
  });

  it("serves single fields as plain text", async () => {
    const expected: Record<string, string> = {
      "/ip": "176.221.158.188",
      "/city": "Tbilisi",
      "/region": "Tbilisi",
      "/country": "GE",
      "/postal": "0100",
      "/loc": "41.6914,44.8341",
      "/timezone": "Asia/Tbilisi",
      "/asn": "AS35805",
      "/org": "JSC Silknet",
      "/ua": "curl/8.22.0",
    };
    for (const [path, value] of Object.entries(expected)) {
      const res = await call(path);
      expect(res.status, path).toBe(200);
      expect(await res.text(), path).toBe(`${value}\n`);
    }
  });

  it("returns 404 with an empty body for unknown values", async () => {
    const res = await call("/city", { cf: {} });
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("");
  });

  it("looks up the hostname", async () => {
    mockDns("host.silknet.example");
    expect(await (await call("/hostname")).text()).toBe("host.silknet.example\n");
    vi.restoreAllMocks();
    mockDns(null);
    expect((await call("/hostname")).status).toBe(404);
  });

  it("returns the request headers as JSON to scripts", async () => {
    const res = await call("/headers", { headers: { ...CURL, cookie: "a=b" } });
    const data = (await res.json()) as Record<string, string>;
    expect(data["user-agent"]).toBe("curl/8.22.0");
    expect(data.cookie).toBe("(hidden, 3 characters)");
    expect(data["cf-connecting-ip"]).toBeUndefined();
  });

  it("answers CORS preflight requests and refuses other methods", async () => {
    const pre = await call("/json", { method: "OPTIONS" });
    expect(pre.status).toBe(204);
    expect(pre.headers.get("access-control-allow-origin")).toBe("*");
    const post = await call("/json", { method: "POST" });
    expect(post.status).toBe(405);
    expect(post.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
  });

  it("sends no body for HEAD requests", async () => {
    const res = await call("/ip", { method: "HEAD" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
  });
});

describe("pages and SEO", () => {
  it("serves every page with its own title, description, canonical and one h1", async () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const path of PAGE_PATHS) {
      const res = await call(path, { headers: BROWSER });
      const body = await res.text();
      expect(res.status, path).toBe(200);
      const title = body.match(/<title>([^<]+)<\/title>/)?.[1];
      const description = body.match(/<meta name="description" content="([^"]+)">/)?.[1];
      expect(title, path).toBeTruthy();
      expect(description, path).toBeTruthy();
      expect(description?.length ?? 0, `${path} description length`).toBeLessThanOrEqual(160);
      titles.add(title ?? "");
      descriptions.add(description ?? "");
      expect(body, path).toContain(`<link rel="canonical" href="https://ip.tooljar.dev${path}">`);
      expect(body.match(/<h1>/g)?.length, path).toBe(1);
      expect(body, path).toContain(
        '<meta property="og:image" content="https://ip.tooljar.dev/og.png">',
      );
      // Every JSON-LD block must be valid JSON.
      const blocks = [...body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
      expect(blocks.length, path).toBeGreaterThan(0);
      for (const [, json] of blocks) expect(() => JSON.parse(json ?? ""), path).not.toThrow();
    }
    expect(titles.size).toBe(PAGE_PATHS.length);
    expect(descriptions.size).toBe(PAGE_PATHS.length);
  });

  it("lists every page in the sitemap", async () => {
    const res = await call("/sitemap.xml");
    expect(res.headers.get("content-type")).toBe("application/xml; charset=utf-8");
    const xml = await res.text();
    for (const path of PAGE_PATHS)
      expect(xml).toContain(`<loc>https://ip.tooljar.dev${path}</loc>`);
  });

  it("serves robots.txt, llms.txt and security.txt", async () => {
    const robots = await (await call("/robots.txt")).text();
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://ip.tooljar.dev/sitemap.xml");
    expect(await (await call("/llms.txt")).text()).toContain("https://ip.tooljar.dev/json");
    expect(await (await call("/.well-known/security.txt")).text()).toContain("Contact: ");
  });

  it("marks the VPN check by network type", async () => {
    const vpn = await (
      await call("/vpn-check", {
        headers: BROWSER,
        cf: { ...TBILISI, asOrganization: "M247 Europe SRL" },
      })
    ).text();
    expect(vpn).toContain('data-state="warn"');
    const home = await (await call("/vpn-check", { headers: BROWSER })).text();
    expect(home).toContain("looks like a regular internet provider");
    const tor = await (
      await call("/vpn-check", { headers: BROWSER, cf: { ...TBILISI, country: "T1" } })
    ).text();
    expect(tor).toContain("Network: you are using Tor");
    const relay = await (
      await call("/vpn-check", {
        headers: BROWSER,
        cf: { ...TBILISI, asn: 13335, asOrganization: "Cloudflare, Inc." },
      })
    ).text();
    expect(relay).toContain("Network: looks like a privacy relay");
  });

  it("shows the IPv6 check to IPv4 visitors", async () => {
    const body = await (await call("/ipv6", { headers: BROWSER })).text();
    expect(body).toContain('data-other-ip="6"');
  });
});

describe("addresses and redirects", () => {
  it("returns a real 404 page that stays out of search", async () => {
    const res = await call("/nope", { headers: BROWSER });
    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain('<meta name="robots" content="noindex">');
    expect(body).not.toContain('rel="canonical"');
    const text = await call("/nope");
    expect(text.status).toBe(404);
    expect(await text.text()).toBe("Not found\n");
  });

  it("removes trailing slashes with a permanent redirect", async () => {
    const res = await call("/ipv6/?a=1", { headers: BROWSER });
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://ip.tooljar.dev/ipv6?a=1");
  });

  it("moves browsers to https but keeps http working for curl", async () => {
    const http = { "cf-visitor": '{"scheme":"http"}' };
    const browser = await call("/", {
      headers: { ...BROWSER, ...http },
      origin: "http://ip.tooljar.dev",
    });
    expect(browser.status).toBe(301);
    expect(browser.headers.get("location")).toBe("https://ip.tooljar.dev/");
    const curl = await call("/", {
      headers: { ...CURL, ...http },
      origin: "http://ip.tooljar.dev",
    });
    expect(curl.status).toBe(200);
    expect(await curl.text()).toBe("176.221.158.188\n");
  });

  it("keeps copies on other addresses out of search", async () => {
    const res = await call("/", {
      headers: BROWSER,
      origin: "https://tooljar-ip.example.workers.dev",
    });
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
    const real = await call("/", { headers: BROWSER });
    expect(real.headers.get("x-robots-tag")).toBeNull();
  });
});
