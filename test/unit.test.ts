import { describe, expect, it } from "vitest";
import { visibleHeaders } from "../src/headers";
import { esc, html, jsonLd, raw } from "../src/html";
import { pickFormat } from "../src/negotiate";
import { networkKind } from "../src/network";
import { expandIPv6, ptrName, reverseDns } from "../src/rdns";
import { describeUserAgent, uaLine } from "../src/ua";
import { countryName } from "../src/visitor";

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const SAFARI_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1";
const EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0";
const FIREFOX_LINUX = "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0";
const SAMSUNG =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36";

describe("expandIPv6", () => {
  it("writes valid addresses out in full", () => {
    expect(expandIPv6("::1")).toBe(`${"0".repeat(31)}1`);
    expect(expandIPv6("::")).toBe("0".repeat(32));
    expect(expandIPv6("2001:db8::1")).toBe("20010db8000000000000000000000001");
    expect(expandIPv6("1:2:3:4:5:6:7:8")).toBe("00010002000300040005000600070008");
    expect(expandIPv6("::ffff:192.0.2.1")).toBe("00000000000000000000ffffc0000201");
    expect(expandIPv6("2001:DB8::A")).toBe("20010db800000000000000000000000a");
  });

  it("rejects invalid addresses", () => {
    for (const bad of [
      "1::2::3",
      "12345::",
      "g::1",
      "1:2:3:4:5:6:7:8:9",
      "1:2:3",
      "",
      "::ffff:999.0.0.1",
    ]) {
      expect(expandIPv6(bad), bad).toBeNull();
    }
  });
});

describe("ptrName", () => {
  it("builds reverse lookup names", () => {
    expect(ptrName("192.0.2.10")).toBe("10.2.0.192.in-addr.arpa");
    expect(ptrName("2001:db8::1")).toBe(
      "1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa",
    );
    expect(ptrName("256.1.1.1")).toBeNull();
    expect(ptrName("not an ip")).toBeNull();
  });
});

describe("reverseDns", () => {
  const answer = (body: unknown, status = 200) =>
    (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it("returns the PTR name without the final dot", async () => {
    const fetcher = answer({ Answer: [{ type: 12, data: "Host-1.Example.NET." }] });
    expect(await reverseDns("192.0.2.1", 500, fetcher)).toBe("host-1.example.net");
  });

  it("returns null when there is no answer, an error, or strange data", async () => {
    expect(await reverseDns("192.0.2.1", 500, answer({ Status: 3 }))).toBeNull();
    expect(await reverseDns("192.0.2.1", 500, answer({}, 500))).toBeNull();
    expect(
      await reverseDns("192.0.2.1", 500, answer({ Answer: [{ type: 12, data: "<b>x</b>." }] })),
    ).toBeNull();
    const failing = (async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    expect(await reverseDns("192.0.2.1", 500, failing)).toBeNull();
    expect(await reverseDns("not an ip", 500, answer({}))).toBeNull();
  });
});

describe("describeUserAgent", () => {
  it("names common browsers and systems", () => {
    expect(uaLine(CHROME_WIN)).toBe("Chrome 141 on Windows");
    expect(uaLine(SAFARI_MAC)).toBe("Safari 18.6 on macOS");
    expect(uaLine(SAFARI_IPHONE)).toBe("Safari 18.6 on iOS");
    expect(uaLine(EDGE)).toBe("Edge 141 on Windows");
    expect(uaLine(FIREFOX_LINUX)).toBe("Firefox 144 on Linux");
    expect(uaLine(SAMSUNG)).toBe("Samsung Internet 28 on Android");
    expect(uaLine("curl/8.22.0")).toBe("curl 8.22.0");
    expect(uaLine("")).toBeNull();
  });

  it("tells phones from computers", () => {
    expect(describeUserAgent(SAFARI_IPHONE).device).toBe("mobile");
    expect(describeUserAgent(SAMSUNG).device).toBe("mobile");
    expect(describeUserAgent(CHROME_WIN).device).toBe("desktop");
  });
});

describe("pickFormat", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://ip.tooljar.dev/", { headers });

  it("gives browsers the page and scripts plain text", () => {
    expect(pickFormat(req({ accept: "text/html,application/xhtml+xml,*/*;q=0.8" }))).toBe("html");
    expect(pickFormat(req({ accept: "*/*", "user-agent": "curl/8.22.0" }))).toBe("text");
    expect(pickFormat(req({ "user-agent": "python-requests/2.32.3" }))).toBe("text");
    expect(pickFormat(req({ accept: "application/json" }))).toBe("json");
  });

  it("gives crawlers and link-preview bots the page", () => {
    const bots = [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
    ];
    for (const ua of bots)
      expect(pickFormat(req({ accept: "*/*", "user-agent": ua })), ua).toBe("html");
  });
});

describe("networkKind", () => {
  const net = (asn: number | null, org: string | null, country: string | null = "DE") =>
    networkKind({ country, asn, org });

  it("is sure about Tor, whatever the network", () => {
    expect(net(24940, "Hetzner Online GmbH", "T1")).toBe("tor");
    expect(net(null, null, "T1")).toBe("tor");
  });

  it("knows privacy relays by their network number", () => {
    expect(net(13335, "Cloudflare, Inc.")).toBe("relay");
    expect(net(36183, "Akamai Technologies, Inc.")).toBe("relay");
  });

  it("knows hosting and VPN networks by number, even with an unhelpful name", () => {
    expect(net(9009, "M247 Europe SRL")).toBe("hosting");
    expect(net(136787, "PacketHub S.A.")).toBe("hosting");
    expect(net(16509, "AMAZON-02")).toBe("hosting");
    expect(net(216025, "Mullvad VPN AB")).toBe("hosting");
  });

  it("falls back to the owner's name for networks not on the list", () => {
    for (const org of ["Example Hosting Ltd", "Tiny VPS Co", "Some Cloud Servers"]) {
      expect(net(64500, org), org).toBe("hosting");
    }
  });

  it("treats internet providers as providers", () => {
    for (const [asn, org] of [
      [35805, "JSC Silknet"],
      [7922, "Comcast Cable Communications, LLC"],
      [8100, "Splice Internet Pty Ltd"],
      [64500, "Nordnet"],
      [16591, "Google Fiber Inc."],
    ] as const) {
      expect(net(asn, org), org).toBe("isp");
    }
  });

  it("says unknown when there is nothing to go on", () => {
    expect(net(null, null)).toBe("unknown");
  });
});

describe("visibleHeaders", () => {
  it("drops Cloudflare's headers, hides cookies and sorts by name", () => {
    const headers = new Headers({
      "user-agent": "test",
      "cf-ray": "abc",
      "cf-connecting-ip": "192.0.2.1",
      "x-forwarded-for": "192.0.2.1",
      cookie: "session=secret",
      accept: "*/*",
    });
    expect(visibleHeaders(headers)).toEqual([
      ["accept", "*/*"],
      ["cookie", "(hidden, 14 characters)"],
      ["user-agent", "test"],
    ]);
  });
});

describe("html helpers", () => {
  it("escapes values but keeps nested html", () => {
    const name = '<img src=x onerror="alert(1)">';
    expect(html`<p>${name}</p>`.value).toBe(
      "<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>",
    );
    expect(html`<ul>${["a", "b"].map((x) => html`<li>${x}</li>`)}</ul>`.value).toBe(
      "<ul><li>a</li><li>b</li></ul>",
    );
    expect(html`${raw("<b>ok</b>")}${null}${false}`.value).toBe("<b>ok</b>");
    expect(esc(`'"&`)).toBe("&#39;&quot;&amp;");
  });

  it("keeps </script> out of JSON-LD", () => {
    expect(jsonLd({ a: "</script><script>alert(1)</script>" }).value).not.toContain(
      "</script><script>",
    );
  });
});

describe("countryName", () => {
  it("turns codes into English names", () => {
    expect(countryName("GE")).toBe("Georgia");
    expect(countryName("DE")).toBe("Germany");
    expect(countryName("T1")).toBe("Tor network");
    expect(countryName("XX")).toBeNull();
    expect(countryName(null)).toBeNull();
  });
});
