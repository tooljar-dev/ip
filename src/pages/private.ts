import { html } from "../html";
import type { Page } from "../layout";
import type { Visitor } from "../visitor";
import { breadcrumbData, type Faq, faqData, faqSection, relatedLinks } from "./parts";

const PATH = "/public-vs-private-ip";

const FAQ: Faq[] = [
  {
    q: "Why do my phone and laptop show the same IP here?",
    a: "Because they share one public IP: the one your internet provider gave your router. Inside your home, each device has its own private IP, but websites only see the shared public one.",
  },
  {
    q: "Is 192.168.1.1 my IP address?",
    a: "Usually not. 192.168.1.1 (or 192.168.0.1) is the private address of many home routers. Your devices get nearby private addresses like 192.168.1.23, and the world sees your public IP instead.",
  },
  {
    q: "Can this site show my private IP?",
    a: "No. Browsers hide your private IP from websites to protect your privacy. To see it, use the steps for your device on this page.",
  },
  {
    q: "Is my public IP static or dynamic?",
    a: "Most home and mobile plans give you a dynamic IP that changes from time to time, for example when the router restarts. A static (fixed) IP is usually a paid extra, useful if you run a server at home.",
  },
  {
    q: "What is CGNAT?",
    a: "Carrier-grade NAT means your provider shares one public IP between many customers. Your router then gets an address from 100.64.0.0 to 100.127.255.255 instead of a public one. Browsing works normally, but you can't open ports for a home server or some games.",
  },
];

export function privatePage(v: Visitor): Page {
  const body = html`<h1>Public vs private IP address</h1>
<p class="lead">Your device has two kinds of address. The public one is what websites see. The private one only works inside your home or office network.</p>
<section class="hero" aria-label="Your public IP address">
<p class="label">Your public IP address right now</p>
<p class="ip${v.version === 6 ? " v6" : ""}">${v.ip}</p>
<div class="hero-row"><button class="btn" type="button" data-copy="${v.ip}">Copy IP</button></div>
</section>
<article>
<h2>Public IP: your address on the internet</h2>
<p>Your internet provider gives your router one public IP. It is unique on the whole internet at that moment, and every website you visit sees it. All devices in your home share it: your phone, laptop and TV all reach the internet through the same public IP.</p>
<h2>Private IP: your address at home</h2>
<p>Your router gives each device its own private IP, like <code>192.168.1.23</code>. These addresses only work inside your network. Millions of homes use the very same private numbers, which is fine, because they never leave the house.</p>
<p>The router keeps a list of which device asked for what, and swaps private and public addresses as traffic goes in and out. This is called NAT (network address translation).</p>
<h2>Private IP ranges</h2>
<p>These address blocks are reserved for private networks, so you'll never see them as a public IP:</p>
<table>
<thead><tr><th>Range</th><th>Short form</th><th>Typical use</th></tr></thead>
<tbody>
<tr><td>10.0.0.0 – 10.255.255.255</td><td><code>10.0.0.0/8</code></td><td>Offices, some routers</td></tr>
<tr><td>172.16.0.0 – 172.31.255.255</td><td><code>172.16.0.0/12</code></td><td>Offices, Docker</td></tr>
<tr><td>192.168.0.0 – 192.168.255.255</td><td><code>192.168.0.0/16</code></td><td>Most home routers</td></tr>
<tr><td>100.64.0.0 – 100.127.255.255</td><td><code>100.64.0.0/10</code></td><td>Shared by providers (CGNAT)</td></tr>
<tr><td>fc00:: – fdff:…</td><td><code>fc00::/7</code></td><td>Private IPv6 (unique local)</td></tr>
<tr><td>fe80:: – febf:…</td><td><code>fe80::/10</code></td><td>IPv6 link-local, one cable or Wi-Fi only</td></tr>
</tbody>
</table>
<h2>How to find your private IP</h2>
<ul>
<li><strong>Windows:</strong> open Command Prompt, type <code>ipconfig</code>, and look for "IPv4 Address".</li>
<li><strong>Mac:</strong> open Terminal and type <code>ipconfig getifaddr en0</code> (Wi-Fi), or open System Settings → Wi-Fi → Details.</li>
<li><strong>Linux:</strong> type <code>hostname -I</code> or <code>ip -4 addr</code>.</li>
<li><strong>iPhone:</strong> Settings → Wi-Fi → tap the (i) next to your network → IP Address.</li>
<li><strong>Android:</strong> Settings → Network &amp; internet → Internet → tap your Wi-Fi network. The exact menu names differ between phone makers.</li>
</ul>
<div class="note"><strong>Tip:</strong> if the "WAN" or "Internet" IP in your router's settings is different from the public IP above, your provider probably uses CGNAT (see the questions below).</div>
</article>
${faqSection(FAQ)}
${relatedLinks(PATH)}`;

  return {
    path: PATH,
    title: "Public vs Private IP Address: What's the Difference?",
    description:
      "Your public IP is what websites see; your private IP only works inside your home network. Learn the difference, the private ranges, and how to find each one.",
    body,
    structuredData: [breadcrumbData(PATH, "Public vs private IP address"), faqData(FAQ)],
  };
}
