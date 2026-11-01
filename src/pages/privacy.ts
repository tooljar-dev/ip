import { html } from "../html";
import type { Page } from "../layout";
import { breadcrumbData } from "./parts";

const PATH = "/privacy";

export function privacyPage(): Page {
  const body = html`<h1>Privacy</h1>
<p class="lead">Short version: we show you your IP address and then forget it. No ads, no cookies, no accounts.</p>
<article>
<h2>What we read</h2>
<p>Every visit and every API call reaches us with your IP address, because that is how the internet sends the answer back. Cloudflare, which runs this site, adds a rough location and the name of the network your IP belongs to. Your browser or script also sends its name and version (the "user agent") and a few other headers. We use all of this only to build the answer you see.</p>
<h2>What we keep</h2>
<p>Nothing. We don't write your IP address, location or headers to a database or a log file. Request logs are turned off for this site. We set no cookies and run no ads.</p>
<h2>Cloudflare</h2>
<p>This site runs on Cloudflare's network. Like any network that delivers web pages, Cloudflare handles your IP address to send you the page, and it keeps some technical data under its own <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">privacy policy</a>. Its firewall also counts requests per IP address for a few seconds, to stop floods of requests (see <a href="/api">fair use</a>).</p>
<h2>Counting visits</h2>
<p>We count page views and page speed with Cloudflare Web Analytics. It uses no cookies, doesn't follow you to other websites and shows us only totals, never who visited.</p>
<h2>Checks that run in your browser</h2>
<p>To show your other IP version, the page asks icanhazip.com (run by Cloudflare) on an IPv4-only or IPv6-only address. The VPN check asks Cloudflare's STUN server which IP a video call would use. These answers stay in your browser; we don't receive them.</p>
<h2>Copy for support</h2>
<p>The "Copy for support" button only puts a summary on your clipboard. Nothing is sent anywhere until you paste it yourself.</p>
<h2>Who runs this site</h2>
<p>tooljar IP is made and run by Saba Janelidze, a developer in Tbilisi, Georgia (<a href="https://www.sabajanelidze.com">sabajanelidze.com</a>). Questions about privacy: <a href="mailto:saba@tooljar.dev">saba@tooljar.dev</a>.</p>
<h2>Your rights</h2>
<p>Because we keep nothing about you, there is nothing for us to show, correct or delete. If you think we got something wrong, write to the address above.</p>
<p>Last updated: 1 November 2026.</p>
</article>`;

  return {
    path: PATH,
    title: "Privacy: What tooljar IP Reads and Keeps",
    description:
      "tooljar IP shows you your IP address and then forgets it. No logs, no cookies, no ads. What we read, what Cloudflare handles, and how visits are counted.",
    body,
    structuredData: [breadcrumbData(PATH, "Privacy")],
  };
}
