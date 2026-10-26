// Building blocks shared by the pages.
import { type Html, html } from "../html";
import { ICONS } from "../icons";
import { NETWORK_LABEL } from "../network";
import { SITE } from "../site";
import { uaLine } from "../ua";
import { placeLine, type Visitor } from "../visitor";

export interface Faq {
  q: string;
  a: string;
}

// The world map in public/world.svg: longitude -180..180, latitude 85..-65.
// Keep in sync with scripts/make-map.mjs.
const MAP = { north: 85, south: -65 };

/** A small world map with a dot where the IP seems to be. Empty when we have no coordinates. */
export function worldMap(v: Visitor): Html {
  if (v.latitude === null || v.longitude === null) return html``;
  const pct = (n: number) => Math.min(100, Math.max(0, n)).toFixed(1);
  const left = pct(((v.longitude + 180) / 360) * 100);
  const top = pct(((MAP.north - v.latitude) / (MAP.north - MAP.south)) * 100);
  return html`<figure class="map" role="img" aria-label="${`World map with a dot near ${placeLine(v) ?? "your network"}`}">
<img src="/world.svg" alt="" width="360" height="150">
<span class="pin" style="${`left:${left}%;top:${top}%`}"></span>
</figure>`;
}

/**
 * The short summary "Copy for support" puts on the clipboard. The line for the other IP
 * version says "checking…" until app.js fills it in.
 */
export function supportReport(v: Visitor, now = new Date()): string {
  const other = v.version === 4 ? 6 : 4;
  return [
    `My internet connection, checked on ${SITE.host}`,
    `IP address: ${v.ip} (IPv${v.version})`,
    `IPv${other}: checking…`,
    `Internet provider: ${v.org ?? "not known"}${v.asn ? ` (AS${v.asn})` : ""}`,
    `Approximate location: ${placeLine(v) ?? "not known"}`,
    `Network type: ${NETWORK_LABEL[v.network]}`,
    `Browser: ${uaLine(v.userAgent) ?? "not known"}`,
    `Time: ${now.toISOString().slice(0, 16).replace("T", " ")} UTC`,
  ].join("\n");
}

/** The big "your IP" box. JavaScript later fills in the other IP family (v4 or v6). */
export function ipHero(v: Visitor, label = "Your public IP address"): Html {
  const other = v.version === 4 ? 6 : 4;
  const map = worldMap(v);
  return html`<section class="hero${map.value ? " has-map" : ""}" aria-label="${label}">
<div class="hero-main">
<p class="label">${label}</p>
<p class="ip${v.version === 6 ? " v6" : ""}" id="ip">${v.ip}</p>
<div class="hero-row">
<button class="btn" type="button" data-copy="${v.ip}">Copy IP</button>
<button class="btn ghost" type="button" data-copy="${supportReport(v)}" data-report title="Copies a short summary of your connection to paste into a support chat or email">Copy for support</button>
<span class="chip">This is your <b>IPv${v.version}</b> address</span>
<span class="chip">IPv${other}: <span data-other-ip="${other}" data-known-ip="${v.ip}">checking…</span></span>
</div>
<p class="calm"><span>No ads</span><span>No cookies</span><span>No VPN sales</span></p>
</div>
${map}
</section>`;
}

export function card(icon: Html, title: string, value: Html | string, sub?: Html | string): Html {
  return html`<div class="card">
<div class="card-head"><span class="badge">${icon}</span>${title}</div>
<p class="value">${value}</p>
${sub ? html`<p class="sub">${sub}</p>` : ""}
</div>`;
}

export function terminal(command: string): Html {
  return html`<div class="terminal"><code>${command}</code><button class="btn" type="button" data-copy="${command}">Copy</button></div>`;
}

export function faqSection(items: Faq[], heading = "Questions people ask"): Html {
  return html`<section class="faq" aria-labelledby="faq">
<h2 id="faq">${heading}</h2>
${items.map((f) => html`<details><summary>${f.q}</summary><p>${f.a}</p></details>`)}
</section>`;
}

export function faqData(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbData(path: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "What is my IP", item: `${SITE.origin}/` },
      { "@type": "ListItem", position: 2, name, item: `${SITE.origin}${path}` },
    ],
  };
}

export const GUIDES: { path: string; icon: Html; title: string; text: string }[] = [
  {
    path: "/ipv6",
    icon: ICONS.six,
    title: "What is my IPv6?",
    text: "Check if your network has IPv6.",
  },
  {
    path: "/location",
    icon: ICONS.pin,
    title: "My IP location",
    text: "Where your IP points, and how exact it is.",
  },
  {
    path: "/vpn-check",
    icon: ICONS.shield,
    title: "Am I on a VPN?",
    text: "Check your VPN and test for leaks.",
  },
  {
    path: "/public-vs-private-ip",
    icon: ICONS.home,
    title: "Public vs private IP",
    text: "Two kinds of address, explained.",
  },
  {
    path: "/headers",
    icon: ICONS.list,
    title: "My HTTP headers",
    text: "What your browser tells every website.",
  },
  {
    path: "/api",
    icon: ICONS.terminal,
    title: "Free IP API",
    text: "Your IP as text or JSON, no key needed.",
  },
];

export function relatedLinks(currentPath: string, heading = "More tools and guides"): Html {
  return html`<h2>${heading}</h2>
<div class="links">${GUIDES.filter((g) => g.path !== currentPath).map(
    (g) =>
      html`<a href="${g.path}"><span class="badge">${g.icon}</span><span><b>${g.title}</b><span class="t">${g.text}</span></span></a>`,
  )}</div>`;
}

export function unknown(text = "Not known"): Html {
  return html`<span class="sub">${text}</span>`;
}
