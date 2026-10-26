import { visibleHeaders } from "../headers";
import { html } from "../html";
import type { Page } from "../layout";
import { SITE } from "../site";
import { breadcrumbData, type Faq, faqData, faqSection, relatedLinks, terminal } from "./parts";

const PATH = "/headers";

const FAQ: Faq[] = [
  {
    q: "What are HTTP headers?",
    a: "Short lines of text that your browser sends with every request, before the actual content. They say which browser you use, which languages you prefer, which formats it understands and more. The website's server reads them to send a page that fits.",
  },
  {
    q: "Why are some headers missing from the list?",
    a: "This site runs on Cloudflare, which adds its own headers (names starting with cf-, and forwarding headers). We remove those so you see what your browser sent. Cookie values are hidden too, so you can share a screenshot safely.",
  },
  {
    q: "Can I change the headers my browser sends?",
    a: "Some of them. The language list follows your browser's language settings, and extensions can change others. Changing the user agent is possible in the browser's developer tools, but websites may then show the wrong version of a page.",
  },
];

const EXPLAINED: [string, string][] = [
  ["user-agent", "Your browser and system describe themselves, for example Chrome on Windows."],
  ["accept", "The file formats your browser can show, like HTML or images."],
  ["accept-language", "Your preferred languages, in order. Websites use it to pick a language."],
  ["accept-encoding", "The compression types your browser understands, like gzip or Brotli (br)."],
  [
    "sec-ch-ua",
    "Client hints: a newer, shorter way for Chrome-based browsers to say what they are.",
  ],
  [
    "sec-fetch-site",
    "Fetch metadata: tells the site whether the request came from the same site or elsewhere.",
  ],
  ["sec-gpc", "Global Privacy Control: you asked websites not to sell or share your data."],
];

export function headersPage(request: Request): Page {
  const rows = visibleHeaders(request.headers);
  const body = html`<h1>What HTTP headers does my browser send?</h1>
<p class="lead">These are the request headers your browser sent to load this page. Every website you open gets a similar list.</p>
<table>
<thead><tr><th>Header</th><th>Value</th></tr></thead>
<tbody>${rows.map(([name, value]) => html`<tr><td><code>${name}</code></td><td>${value}</td></tr>`)}</tbody>
</table>
<h2>Get them as JSON</h2>
<p>From a terminal or a script, the same address returns JSON:</p>
${terminal(`curl ${SITE.host}/headers`)}
<article>
<h2>What the common headers mean</h2>
<ul>
${EXPLAINED.map(([name, text]) => html`<li><code>${name}</code>: ${text}</li>`)}
</ul>
</article>
${faqSection(FAQ)}
${relatedLinks(PATH)}`;

  return {
    path: PATH,
    title: "What HTTP Headers Does My Browser Send? View Request Headers",
    description:
      "See the HTTP request headers your browser sends to every website: user agent, languages, formats and more. Also available as JSON for developers.",
    body,
    structuredData: [breadcrumbData(PATH, "My HTTP headers"), faqData(FAQ)],
  };
}
