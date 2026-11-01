import { html } from "../html";
import type { Page } from "../layout";
import { placeLine, type Visitor } from "../visitor";
import { breadcrumbData, type Faq, faqData, faqSection, relatedLinks, worldMap } from "./parts";

const PATH = "/location";

const FAQ: Faq[] = [
  {
    q: "How accurate is IP location?",
    a: "The country is right almost every time. The city is often right for home internet, but it can be off by 10 to 100 kilometers or more, and for mobile data it can be very far off. It never shows your street or your house.",
  },
  {
    q: "Can someone find my exact address from my IP?",
    a: "No. Websites only see the rough area. Your internet provider knows which customer had which IP, but it normally shares that only with the police or a court.",
  },
  {
    q: "Why does my IP show a different city?",
    a: "Your provider may send your traffic through a hub in another city, the location database may be out of date, or you may be using a VPN, a proxy or iCloud Private Relay. In all these cases websites see the location of the network, not of you.",
  },
  {
    q: "How do I change my IP location?",
    a: "Connect through a VPN or the Tor Browser. Websites then see the location of the VPN or Tor server. If your location is simply wrong, you can ask the big location databases (for example MaxMind or IPinfo) to correct it; most have a form for that.",
  },
];

function row(label: string, value: string | null) {
  return html`<tr><th scope="row">${label}</th><td>${value ?? "Not known"}</td></tr>`;
}

export function locationPage(v: Visitor): Page {
  const place = placeLine(v);
  const coords =
    v.latitude !== null && v.longitude !== null
      ? `${v.latitude.toFixed(2)}, ${v.longitude.toFixed(2)}`
      : null;
  const map =
    v.latitude !== null && v.longitude !== null
      ? `https://www.openstreetmap.org/?mlat=${v.latitude.toFixed(3)}&mlon=${v.longitude.toFixed(3)}#map=10/${v.latitude.toFixed(3)}/${v.longitude.toFixed(3)}`
      : null;
  const drawn = worldMap(v);

  const body = html`<h1>What is my IP location?</h1>
<p class="lead">This is where your IP address seems to be, according to Cloudflare's location data. It is the network's location, so treat it as "roughly here".</p>
<section class="hero${drawn.value ? " has-map" : ""}" aria-label="Your IP location">
<div class="hero-main">
<p class="label">Your IP address ${v.ip} points to</p>
<p class="ip v6">${place ?? "an unknown place"}</p>
${map ? html`<div class="hero-row"><a class="btn ghost" href="${map}" rel="noopener">See this area on OpenStreetMap</a></div>` : ""}
</div>
${drawn}
</section>
<table>
<tbody>
${row("City", v.city)}
${row("Region", v.region)}
${row("Country", v.countryName ?? v.country)}
${row("Postal code", v.postalCode)}
${row("Time zone", v.timezone)}
${row("Coordinates (rough)", coords)}
${row("Internet provider", v.org)}
</tbody>
</table>
<article>
<h2>How does IP location work?</h2>
<p>Every IP address belongs to a block of addresses that an internet provider uses in some area. Companies collect where these blocks are used, from internet registries, from the providers themselves and from measurements, and put it in a database. A website looks up your IP in such a database. We use the data that Cloudflare adds to every request.</p>
<h2>Why can it be wrong?</h2>
<ul>
<li><strong>Your provider uses a hub in another city.</strong> Then the database places you at the hub.</li>
<li><strong>Mobile data.</strong> Phone networks often send everyone in a large region through a few big gateways.</li>
<li><strong>VPN, proxy or iCloud Private Relay.</strong> Websites see the location of that service's server.</li>
<li><strong>Old data.</strong> Address blocks move between providers and places, and databases catch up slowly.</li>
</ul>
<p>More reasons, a check for your own connection and how to get it corrected: <a href="/why-is-my-location-wrong">Why is my IP location wrong?</a></p>
<h2>What IP location never shows</h2>
<p>Your street, your house or your name. IP location is good enough to pick a language or show prices in your currency, and that's about it.</p>
</article>
${faqSection(FAQ)}
${relatedLinks(PATH)}`;

  return {
    path: PATH,
    title: "What Is My IP Location? See Where Your IP Address Points",
    description:
      "See the approximate location of your IP address: city, region, country and time zone. Learn how accurate IP location is and why it can be wrong.",
    body,
    structuredData: [breadcrumbData(PATH, "My IP location"), faqData(FAQ)],
  };
}
