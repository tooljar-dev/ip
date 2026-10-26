import { html } from "../html";
import { ICONS } from "../icons";
import type { Page } from "../layout";
import { SITE } from "../site";
import { uaLine } from "../ua";
import { placeLine, type Visitor } from "../visitor";
import {
  card,
  type Faq,
  faqData,
  faqSection,
  ipHero,
  relatedLinks,
  terminal,
  unknown,
} from "./parts";

const FAQ: Faq[] = [
  {
    q: "What is an IP address?",
    a: "An IP address is the number that identifies your connection on the internet, a bit like the return address on a letter. Websites need it to send their pages back to you. It looks like 203.0.113.42 (IPv4) or 2001:db8::1 (IPv6).",
  },
  {
    q: "Can someone find my home address from my IP?",
    a: "No. An IP address shows only a rough area, usually a city, and the company that gives you internet. Only your internet provider can link an IP to a customer's name and address, and they normally do that only for the police or a court.",
  },
  {
    q: "Why does my IP location look wrong?",
    a: "IP location comes from databases that guess where an address is used. Your provider may send traffic through another city, mobile networks often show a far-away city, and VPNs or iCloud Private Relay show the location of their own servers. The country is usually right; the city is often only close.",
  },
  {
    q: "Why do I have two IP addresses, IPv4 and IPv6?",
    a: "Many networks now use both versions at the same time. IPv4 is the older, shorter format and IPv6 is the newer, longer one. Your device picks one for each connection, so different websites may see a different one.",
  },
  {
    q: "Does my IP address change?",
    a: "Usually yes, from time to time. Most home and mobile internet plans use a dynamic IP, which changes when your router restarts or after some days. A fixed (static) IP is normally a paid extra from your provider.",
  },
  {
    q: "How can I hide my IP address?",
    a: "Use a VPN, the Tor Browser or a proxy. Websites then see the IP of that service instead of yours. Our VPN check page shows whether it is working.",
  },
  {
    q: "Do you save my IP address?",
    a: "No. This page reads your IP to show it to you, and then forgets it. We set no cookies and show no ads.",
  },
];

function tlsName(version: string | null): string | null {
  const match = version?.match(/^TLSv?(\d(?:\.\d)?)$/i);
  return match ? `TLS ${match[1]}` : version;
}

export function homePage(v: Visitor): Page {
  const place = placeLine(v);
  const browser = uaLine(v.userAgent);
  const tls = tlsName(v.tlsVersion);
  const body = html`<h1>What is my IP address?</h1>
${ipHero(v)}
<div class="grid">
${card(
  ICONS.pin,
  "Location",
  place ?? unknown(),
  html`${v.timezone ? `Time zone: ${v.timezone}. ` : ""}<a href="/location">How exact is this?</a>`,
)}
${card(ICONS.globe, "Internet provider", v.org ?? unknown(), v.asn ? `Network AS${v.asn}` : undefined)}
${card(
  ICONS.server,
  "Hostname",
  html`<span data-hostname>checking…</span>`,
  "The name your IP points back to (reverse DNS).",
)}
${card(
  ICONS.browser,
  "Your browser",
  browser ?? unknown("Unknown browser"),
  html`<details class="ua"><summary>Full user agent</summary><code>${v.userAgent || "(none sent)"}</code></details>`,
)}
${card(
  ICONS.lock,
  "Connection",
  tls ? `Secure (${tls})` : "Secure (HTTPS)",
  [v.httpProtocol, v.colo ? `Cloudflare data center ${v.colo}` : null]
    .filter(Boolean)
    .join(" · ") || undefined,
)}
</div>
<h2>Get your IP from the terminal</h2>
<p>One command, no sign-up. It prints just your IP address:</p>
${terminal(`curl ${SITE.host}`)}
<p>Need more? <code>curl ${SITE.host}/json</code> gives your location and network as JSON. See the <a href="/api">free IP API</a>.</p>
${relatedLinks("/", "Learn more")}
${faqSection(FAQ)}`;

  return {
    path: "/",
    title: "What Is My IP Address? See Your Public IP, Location & ISP",
    description:
      "See your public IP address (IPv4 and IPv6) instantly, plus your rough location, internet provider and browser. Free, no ads, no cookies, with a free API.",
    body,
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: `${SITE.origin}/`,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "What is my IP address",
        url: `${SITE.origin}/`,
        description:
          "Shows your public IP address (IPv4 and IPv6), rough location, internet provider, hostname and browser. Free, with a plain-text and JSON API.",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      faqData(FAQ),
    ],
  };
}
