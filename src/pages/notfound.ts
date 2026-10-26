import { html } from "../html";
import type { Page } from "../layout";
import { relatedLinks } from "./parts";

export function notFoundPage(path: string): Page {
  return {
    path,
    title: "Page not found | tooljar IP",
    description: "This page doesn't exist. See your IP address on the home page.",
    status: 404,
    noindex: true,
    body: html`<h1>Page not found</h1>
<p class="lead">There is nothing at <code>${path}</code>. Maybe the link has a typo.</p>
<p><a class="btn" href="/">Show my IP address</a></p>
${relatedLinks("", "Or try one of these")}`,
  };
}
