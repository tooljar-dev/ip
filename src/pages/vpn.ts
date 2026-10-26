import { type Html, html } from "../html";
import type { Page } from "../layout";
import { placeLine, type Visitor } from "../visitor";
import { breadcrumbData, type Faq, faqData, faqSection, ipHero, relatedLinks } from "./parts";

const PATH = "/vpn-check";

const FAQ: Faq[] = [
  {
    q: "How do I know if my VPN is working?",
    a: "Open this page with the VPN off and note the IP and location. Turn the VPN on and reload. If the IP and the internet provider changed to the VPN's, and the checks show no leak, the VPN is working.",
  },
  {
    q: "What is a WebRTC leak?",
    a: "WebRTC is the browser feature behind video calls. To connect calls it can find your public IP, and with some VPN setups it finds your real one, which a website could then read. Most good VPN apps block this; a browser extension or setting can turn it off too.",
  },
  {
    q: "Can a website tell for sure that I use a VPN?",
    a: "Not for sure. It can see that your IP belongs to a hosting or VPN company, or that your clock and your IP's time zone don't match. Some VPNs use home internet addresses, and then even that is hard to spot.",
  },
  {
    q: "Can this page tell if I use Tor?",
    a: "Yes, and that answer is certain. The Tor Project publishes the list of its exit servers, and Cloudflare marks visitors who come from them. VPNs and privacy relays have no such list, so for them the page can only estimate.",
  },
  {
    q: "Does this test check DNS leaks?",
    a: "No. A DNS leak (your device asking your provider's servers for website names instead of the VPN's) needs a special DNS server to test. Many VPN providers offer a DNS leak test on their own site.",
  },
];

function networkCheck(v: Visitor): Html {
  const owner = html`<strong>${v.org ?? "an unknown owner"}</strong>${v.asn ? ` (AS${v.asn})` : ""}`;
  switch (v.network) {
    case "tor":
      return html`<div class="check" data-state="warn"><span class="dot">!</span><div><h3>Network: you are using Tor</h3>
<p>Your connection comes out of the Tor network, through a server owned by ${owner}. Websites see that Tor server, not your real IP. This one is certain: the list of Tor exit servers is public, and Cloudflare marks them, so many websites can tell too.</p></div></div>`;
    case "relay":
      return html`<div class="check" data-state="warn"><span class="dot">!</span><div><h3>Network: looks like a privacy relay</h3>
<p>Your IP belongs to ${owner}, which runs privacy relays such as iCloud Private Relay and Cloudflare WARP (the 1.1.1.1 app). Websites see the relay's address and only a rough region, not your own IP. This is an estimate.</p></div></div>`;
    case "hosting":
      return html`<div class="check" data-state="warn"><span class="dot">!</span><div><h3>Network: hosting or VPN network (estimate)</h3>
<p>Your IP belongs to ${owner}. Home internet doesn't usually come from such networks, so you are probably using a VPN, a proxy or a server.</p></div></div>`;
    case "isp":
      return html`<div class="check" data-state="ok"><span class="dot">✓</span><div><h3>Network: looks like a regular internet provider</h3>
<p>Your IP belongs to ${owner}. If you meant to use a VPN, websites can probably see your real provider. Some VPNs use home addresses, so this is a hint, not proof.</p></div></div>`;
    default:
      return html`<div class="check"><span class="dot">?</span><div><h3>Network: not known</h3><p>We couldn't tell who owns your IP address.</p></div></div>`;
  }
}

export function vpnPage(v: Visitor): Page {
  const network = networkCheck(v);

  const body = html`<h1>Am I using a VPN?</h1>
<p class="lead">Three quick checks show what websites can see: the network your IP comes from, your time zone, and whether your browser leaks another IP through WebRTC.</p>
${ipHero(v, "The IP address websites see")}
<p>Location websites see: <strong>${placeLine(v) ?? "not known"}</strong>.</p>
<div class="checks">
${network}
<div class="check" data-tz-check data-ip-tz="${v.timezone ?? ""}"><span class="dot">…</span><div><h3>Time zone</h3><p>Comparing your device's time zone with your IP's time zone…</p></div></div>
<div class="check" data-webrtc data-known-ip="${v.ip}"><span class="dot">…</span><div><h3>WebRTC leak test</h3><p>Asking your browser which public IP it would share in a video call…</p></div></div>
</div>
<noscript><p class="note">The time zone and WebRTC checks run in your browser, so they need JavaScript.</p></noscript>
<article>
<h2>What these checks mean</h2>
<h3>Network</h3>
<p>Every IP belongs to a network with an owner and a number (ASN). Home and mobile internet come from providers like Comcast or Vodafone. VPN servers usually sit in data centers owned by hosting companies. We check the network's number against a list of known hosting, VPN and privacy-relay networks, and then the owner's name, to guess which one you have. Tor is different: the list of Tor exit servers is public, so that answer is certain.</p>
<h3>Time zone</h3>
<p>Your browser knows your device's time zone, and your IP has a time zone too. If they differ, you might be using a VPN or proxy in another country, or you are simply traveling.</p>
<h3>WebRTC</h3>
<p>Your browser uses WebRTC for video calls in the browser. It asks a public server (called a STUN server; we use Cloudflare's) which IP it sees. If that answer differs from the IP above, a website could find an IP your VPN was meant to hide.</p>
<h2>How to fix a leak</h2>
<ul>
<li>Turn on "leak protection" or a "kill switch" in your VPN app.</li>
<li>Make sure your VPN covers IPv6, or turn IPv6 off while using it. Check on our <a href="/ipv6">IPv6 page</a>.</li>
<li>Use a browser setting or extension that limits WebRTC. In Firefox you can turn it off in <code>about:config</code> with <code>media.peerconnection.enabled</code>.</li>
</ul>
</article>
${faqSection(FAQ)}
${relatedLinks(PATH)}`;

  return {
    path: PATH,
    title: "Am I Using a VPN? Free VPN & WebRTC Leak Check",
    description:
      "Check if your VPN is working: see the IP and network websites see, compare your time zone, and test for WebRTC leaks. Free, runs in your browser.",
    body,
    structuredData: [breadcrumbData(PATH, "Am I using a VPN?"), faqData(FAQ)],
  };
}
