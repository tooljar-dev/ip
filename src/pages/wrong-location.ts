import { type Html, html } from "../html";
import type { Page } from "../layout";
import { placeLine, type Visitor } from "../visitor";
import { breadcrumbData, type Faq, faqData, faqSection, relatedLinks } from "./parts";

const PATH = "/why-is-my-location-wrong";

const FAQ: Faq[] = [
  {
    q: "Why does my phone show a different city than my computer?",
    a: "On mobile data your phone uses your mobile network's IP, which goes out through a gateway that can be far away. On home Wi-Fi it uses your home IP. Same phone, two networks, two locations.",
  },
  {
    q: "Why do two websites show different locations?",
    a: "They use different location databases, and each company builds its own. Neither is wrong on purpose; they just guessed differently.",
  },
  {
    q: "How long does a correction take?",
    a: "Cloudflare says a confirmed correction usually takes a few business days. Each database is separate, and many websites keep their own copy and update it less often, so some sites can take weeks.",
  },
  {
    q: "Can a website see my real location if my IP location is wrong?",
    a: "Only if you allow it. Your browser can share your exact location from GPS or Wi-Fi, but it always asks you first. Without that, a website only has the guess from your IP.",
  },
];

// The most likely reason for this visitor, from the network type (only Tor is certain).
function reasonCheck(v: Visitor): Html {
  const owner = html`<strong>${v.org ?? "an unknown owner"}</strong>${v.asn ? ` (AS${v.asn})` : ""}`;
  switch (v.network) {
    case "tor":
      return html`<div class="check" data-state="warn"><span class="dot">!</span><div><h3>You are using Tor</h3>
<p>Tor sends your connection out through a server that can be in any country, here one owned by ${owner}. The location above is that server's, not yours. That is how Tor is meant to work.</p></div></div>`;
    case "relay":
      return html`<div class="check" data-state="warn"><span class="dot">!</span><div><h3>Likely reason: a privacy relay</h3>
<p>Your IP belongs to ${owner}, which runs privacy relays such as iCloud Private Relay and Cloudflare WARP (the 1.1.1.1 app). Websites see the relay's address, which shows only your general area or your country, on purpose. Turn the relay off for a site that needs your real region. This is an estimate.</p></div></div>`;
    case "hosting":
      return html`<div class="check" data-state="warn"><span class="dot">!</span><div><h3>Likely reason: a VPN or a server</h3>
<p>Your IP belongs to ${owner}, a hosting or VPN network. Websites see where that server is, not where you are. Turn the VPN off, or pick a server in your own country. This is an estimate.</p></div></div>`;
    case "isp":
      return html`<div class="check" data-state="ok"><span class="dot">✓</span><div><h3>Your network: a regular internet provider</h3>
<p>Your IP belongs to ${owner}, so it isn't a VPN or relay (this is an estimate). If the place above is wrong, the reasons below are the likely ones: a hub in another city, mobile data, or old data.</p></div></div>`;
    default:
      return html`<div class="check"><span class="dot">?</span><div><h3>Your network: not known</h3><p>We couldn't tell who owns your IP address, so we can't say which reason fits.</p></div></div>`;
  }
}

export function wrongLocationPage(v: Visitor): Page {
  const body = html`<h1>Why is my IP location wrong?</h1>
<p class="lead">Websites guess where you are from your IP address. The guess is about your network, not about you, so it can be off by a city or even a country. Here is what we see, why it happens and what you can do.</p>
<section aria-label="Your location check">
<p>Your IP address <strong>${v.ip}</strong> looks like it's in <strong>${placeLine(v) ?? "an unknown place"}</strong>.</p>
<div class="checks">
${reasonCheck(v)}
<div class="check" data-tz-check data-ip-tz="${v.timezone ?? ""}"><span class="dot">…</span><div><h3>Time zone</h3><p>Comparing your device's time zone with your IP's time zone…</p></div></div>
</div>
<noscript><p class="note">The time zone check runs in your browser, so it needs JavaScript.</p></noscript>
</section>
<article>
<h2>Six common reasons</h2>
<h3>1. Your provider sends you through a hub</h3>
<p>Many internet providers send the traffic of a whole region through one place, often the capital or a big city. Location databases then put every customer there.</p>
<h3>2. You are on mobile data</h3>
<p>Phone networks share one public IP among many customers (this is called carrier-grade NAT) and send them out through a few big gateways. Your phone can show a city hundreds of kilometers away, and a different one tomorrow.</p>
<h3>3. A VPN, proxy, work network or privacy relay</h3>
<p>Websites see where that service's server is. iCloud Private Relay and similar relays show only your general area or your country, on purpose. A work laptop on the company network often shows the head office. Our <a href="/vpn-check">VPN check</a> tells you if your connection goes through one.</p>
<h3>4. The address block moved</h3>
<p>IP addresses are bought, sold and moved between providers and countries. Location databases catch up later. Cloudflare, whose data this site uses, updates its data several times a week; other databases may be slower.</p>
<h3>5. Your IPv4 and IPv6 addresses point to different places</h3>
<p>If your network has both kinds of address, each one has its own entry in the databases, and they don't always agree. A website may see either one. Our <a href="/ipv6">IPv6 page</a> shows if you have both.</p>
<h3>6. Websites use different databases</h3>
<p>There is no single official list of where IP addresses are. Each company builds its own, so two sites can show two different cities for the same address. Cloudflare itself says it can't promise its data matches other providers.</p>
<h2>How exact can IP location be?</h2>
<p>For scale: MaxMind, one of the biggest location databases, says that for addresses in the United States its city guess is within 50 km about 60% of the time, farther off about 32% of the time, and has no city at all for the rest (<a href="https://www.maxmind.com/en/geoip-accuracy-comparison" rel="noopener">MaxMind's accuracy page</a>, checked November 2026). No IP database shows your street or your house.</p>
<h2>What you can do</h2>
<h3>A website shows the wrong country or language</h3>
<ul>
<li>Turn off your VPN or relay for that site, or pick a server in your own country.</li>
<li>Look for a country or language switch on the site itself. Most big sites let you choose.</li>
<li>Reload this page after a change to see what websites see now.</li>
</ul>
<h3>Your home internet shows the wrong city</h3>
<ul>
<li>Ask your internet provider to fix it. Providers can publish the real location of their addresses in a standard file called a geofeed (<a href="https://www.rfc-editor.org/rfc/rfc8805" rel="noopener">RFC 8805</a>), and the databases read it.</li>
<li>Report it yourself, with your IP and your real city: <a href="https://www.cloudflare.com/lp/ip-corrections/" rel="noopener">Cloudflare</a>, <a href="https://www.maxmind.com/en/geoip-location-correction" rel="noopener">MaxMind</a> and <a href="https://ipinfo.io/corrections" rel="noopener">IPinfo</a> each have a form. They check every request before they change anything.</li>
<li>On mobile data a correction rarely helps, because your phone's IP changes often. Cloudflare says the same.</li>
</ul>
<h3>A service blocks you because of your location</h3>
<p>Streaming, banking and shopping sites use IP location to decide what you may see. If they get it wrong, contact their support and tell them the IP and the place they see. The "Copy for support" button on our <a href="/">home page</a> puts exactly that on your clipboard.</p>
</article>
${faqSection(FAQ)}
${relatedLinks(PATH)}`;

  return {
    path: PATH,
    title: "Why Is My IP Location Wrong? 6 Reasons and How to Fix It",
    description:
      "Your IP location can be off by a city or a country. See what websites see, why it happens (mobile data, VPNs, old data) and how to get it corrected.",
    body,
    structuredData: [breadcrumbData(PATH, "Why is my IP location wrong?"), faqData(FAQ)],
  };
}
