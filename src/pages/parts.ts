// Building blocks shared by the pages.
import { type Html, html } from "../html";
import { ICONS } from "../icons";
import { SITE } from "../site";
import type { Visitor } from "../visitor";

export interface Faq {
  q: string;
  a: string;
}

/** The big "your IP" box. JavaScript later fills in the other IP family (v4 or v6). */
export function ipHero(v: Visitor, label = "Your public IP address"): Html {
  const other = v.version === 4 ? 6 : 4;
  return html`<section class="hero" aria-label="${label}">
<p class="label">${label}</p>
<p class="ip${v.version === 6 ? " v6" : ""}" id="ip">${v.ip}</p>
<div class="hero-row">
<button class="btn" type="button" data-copy="${v.ip}">Copy IP</button>
<span class="chip">This is your <b>IPv${v.version}</b> address</span>
<span class="chip">IPv${other}: <span data-other-ip="${other}" data-known-ip="${v.ip}">checking…</span></span>
</div>
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
