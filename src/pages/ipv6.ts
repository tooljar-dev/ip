import { html } from "../html";
import type { Page } from "../layout";
import { SITE } from "../site";
import type { Visitor } from "../visitor";
import { breadcrumbData, type Faq, faqData, faqSection, relatedLinks, terminal } from "./parts";

const PATH = "/ipv6";

const FAQ: Faq[] = [
  {
    q: "What does an IPv6 address look like?",
    a: "Eight groups of four hexadecimal digits (0–9 and a–f), split by colons, like 2001:0db8:0000:0000:0000:0000:0000:0001. Runs of zeros can be shortened to ::, so the same address is usually written 2001:db8::1.",
  },
  {
    q: "Is it bad if I don't have IPv6?",
    a: "No. Almost every website still works over IPv4, so you won't notice anything missing. IPv6 matters more for providers, games and some home servers.",
  },
  {
    q: "Can IPv6 get past my VPN?",
    a: "It can, if your VPN only protects IPv4. Then websites may see your real IPv6 address. Good VPNs either tunnel IPv6 too or block it. Our VPN check page tests for this.",
  },
  {
    q: "How do I turn on IPv6?",
    a: "First check that your internet provider offers it. Then look in your router's settings for an IPv6 option (often called IPv6, DHCPv6 or SLAAC) and switch it on. Phones on mobile data often have IPv6 already.",
  },
];

export function ipv6Page(v: Visitor): Page {
  const answer =
    v.version === 6
      ? html`<section class="hero" aria-label="Your IPv6 address">
<p class="label">Your IPv6 address</p>
<p class="ip v6">${v.ip}</p>
<div class="hero-row"><button class="btn" type="button" data-copy="${v.ip}">Copy IPv6</button>
<span class="chip">Good news: <b>your network supports IPv6</b></span>
<span class="chip">IPv4: <span data-other-ip="4" data-known-ip="${v.ip}">checking…</span></span></div>
</section>`
      : html`<section class="hero" aria-label="Your IPv6 address">
<p class="label">Your IPv6 address</p>
<p class="ip v6" data-other-ip="6" data-known-ip="${v.ip}" data-none="No IPv6 found">checking…</p>
<div class="hero-row"><span class="chip">You reached this page over <b>IPv4</b>: ${v.ip}</span></div>
<p class="sub">If no IPv6 address shows up, your network or provider probably doesn't offer IPv6 yet. That's common, and websites still work fine.</p>
</section>`;

  const body = html`<h1>What is my IPv6 address?</h1>
<p class="lead">Check your public IPv6 address and whether your network supports IPv6 at all.</p>
${answer}
<article>
<h2>What is IPv6?</h2>
<p>IPv6 is the newer version of the internet address system. The old version, IPv4, has about 4.3 billion addresses, and they ran out years ago. IPv6 addresses are much longer (128 bits instead of 32), so there are enough for every device on Earth many times over.</p>
<p>An IPv4 address looks like <code>203.0.113.42</code>. An IPv6 address looks like <code>2001:db8:85a3::8a2e:370:7334</code>.</p>
<h2>Why do I have both IPv4 and IPv6?</h2>
<p>Most networks that offer IPv6 also keep IPv4. This is called "dual stack". For each connection your device tries both and uses the one that answers first. So one website may see your IPv4 address, and the next one your IPv6 address. That is why this site shows both.</p>
<h2>Why don't I have IPv6?</h2>
<ul>
<li><strong>Your provider doesn't offer it yet.</strong> This is the most common reason.</li>
<li><strong>It is switched off in your router.</strong> Look for an IPv6 setting.</li>
<li><strong>Your VPN or company network blocks it,</strong> often on purpose, so that nothing gets past the VPN.</li>
</ul>
<h2>Test it from the terminal</h2>
<p>Ask for one version on purpose with <code>-6</code> or <code>-4</code>:</p>
${terminal(`curl -6 ${SITE.host}`)}
${terminal(`curl -4 ${SITE.host}`)}
<p>If the <code>-6</code> command fails, your computer has no working IPv6 connection.</p>
</article>
${faqSection(FAQ)}
${relatedLinks(PATH)}`;

  return {
    path: PATH,
    title: "What Is My IPv6 Address? Check If You Have IPv6",
    description:
      "Check your public IPv6 address and see whether your network supports IPv6. Learn what IPv6 is, why you might not have it, and how to test it.",
    body,
    structuredData: [breadcrumbData(PATH, "What is my IPv6 address"), faqData(FAQ)],
  };
}
