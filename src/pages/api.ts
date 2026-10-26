import { html } from "../html";
import type { Page } from "../layout";
import { SITE } from "../site";
import { toJson, type Visitor } from "../visitor";
import { breadcrumbData, type Faq, faqData, faqSection, relatedLinks, terminal } from "./parts";

const PATH = "/api";

const FAQ: Faq[] = [
  {
    q: "Do I need an API key?",
    a: "No. There is no key, no sign-up and no cost. Just call the address.",
  },
  {
    q: "Is there a rate limit?",
    a: "Please keep it reasonable: fetch your IP when you need it, not in a tight loop. A single address that sends a burst of many requests in a few seconds gets HTTP 429 (too many requests) for a short time.",
  },
  {
    q: "Can I look up someone else's IP address?",
    a: "No. The API only answers about the IP that is calling it. The location data comes with each request from Cloudflare, so there is no database to search.",
  },
  {
    q: "Can I use it in my app or company?",
    a: "Yes, for free, including commercial use. The code is open source under the MIT license, so you can also run your own copy on Cloudflare Workers.",
  },
  {
    q: "Will the addresses and fields change?",
    a: "No. The paths and JSON field names are stable. We may add new fields, but we won't rename or remove existing ones.",
  },
];

const ENDPOINTS: [string, string][] = [
  ["/", "Your IP as plain text for scripts and terminals (browsers get this web page)"],
  ["/ip", "Your IP as plain text, always"],
  ["/json", "All fields below as JSON"],
  ["/city", "City"],
  ["/region", "Region or state"],
  ["/country", "Two-letter country code, like DE"],
  ["/postal", "Postal code"],
  ["/loc", "Latitude and longitude, like 52.52,13.40"],
  ["/timezone", "Time zone, like Europe/Berlin"],
  ["/asn", "Network number, like AS3320"],
  ["/org", "Network owner, usually your internet provider"],
  ["/hostname", "Reverse DNS name of your IP"],
  ["/ua", "Your user agent"],
  ["/headers", "Your request headers as JSON (browsers get a page)"],
];

export function apiPage(v: Visitor): Page {
  const example = JSON.stringify(toJson(v, null), null, 2);
  const body = html`<h1>Free IP address API</h1>
<p class="lead">Get your public IP, location and network from any script or app. No key, no sign-up, CORS on, answered at the Cloudflare edge close to you.</p>
${terminal(`curl ${SITE.host}`)}
${terminal(`curl ${SITE.host}/json`)}
<h2>Endpoints</h2>
<p>Every address works over <code>https://</code> and, for old scripts, plain <code>http://</code>. Each text answer ends with a new line. When a value is not known, the address returns status 404 with an empty body.</p>
<table>
<thead><tr><th>Address</th><th>Returns</th></tr></thead>
<tbody>${ENDPOINTS.map(([path, text]) => html`<tr><td><code>${SITE.host}${path === "/" ? "" : path}</code></td><td>${text}</td></tr>`)}</tbody>
</table>
<h2>JSON fields</h2>
<p>This is your own answer right now (<code>hostname</code> is filled in by the real API):</p>
<pre><code>${example}</code></pre>
<p><code>hostname</code>, and any field we can't fill, is <code>null</code>. <code>asn</code> is a number. <code>version</code> is 4 or 6.</p>
<h2>Examples</h2>
<h3>Shell</h3>
<pre><code>IP=$(curl -s ${SITE.host})
echo "My IP is $IP"</code></pre>
<h3>JavaScript (browser or Node.js)</h3>
<pre><code>const res = await fetch("https://${SITE.host}/json");
const { ip, city, country } = await res.json();</code></pre>
<h3>Python</h3>
<pre><code>import requests

data = requests.get("https://${SITE.host}/json", timeout=5).json()
print(data["ip"], data["country"])</code></pre>
<h3>PowerShell</h3>
<pre><code>(Invoke-RestMethod https://${SITE.host}/json).ip</code></pre>
<h2>IPv4 or IPv6</h2>
<p>The API answers with the IP your connection used. To ask for one version on purpose, use <code>curl -4 ${SITE.host}</code> or <code>curl -6 ${SITE.host}</code>.</p>
<h2>Asking for JSON on any address</h2>
<p>Send <code>Accept: application/json</code> and the home address answers in JSON too: <code>curl -H "Accept: application/json" ${SITE.host}</code>.</p>
<h2>Open source</h2>
<p>The whole site is one small Cloudflare Worker. Read the code, report a problem or run your own copy: <a href="${SITE.repo}">${SITE.repo.replace("https://", "")}</a>.</p>
${faqSection(FAQ)}
${relatedLinks(PATH)}`;

  return {
    path: PATH,
    title: "Free IP Address API: Get Your Public IP as Text or JSON",
    description:
      "A free, fast IP API with no key and no sign-up. curl ip.tooljar.dev for plain text, or /json for location and network data. CORS enabled.",
    body,
    structuredData: [
      breadcrumbData(PATH, "Free IP API"),
      {
        "@context": "https://schema.org",
        "@type": "WebAPI",
        name: "tooljar IP API",
        description: "Free API that returns the caller's public IP address, location and network.",
        url: `${SITE.origin}/json`,
        documentation: `${SITE.origin}/api`,
        provider: { "@type": "Organization", name: "tooljar", url: SITE.origin },
        isAccessibleForFree: true,
      },
      faqData(FAQ),
    ],
  };
}
