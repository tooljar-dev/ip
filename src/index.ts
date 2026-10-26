// tooljar IP: the Worker behind https://ip.tooljar.dev.
// Static files (icons, app.js) are served from ./public before this code runs.
import { visibleHeaders } from "./headers";
import { type Page, renderPage } from "./layout";
import { pickFormat } from "./negotiate";
import { apiPage } from "./pages/api";
import { headersPage } from "./pages/headers";
import { homePage } from "./pages/home";
import { ipv6Page } from "./pages/ipv6";
import { locationPage } from "./pages/location";
import { notFoundPage } from "./pages/notfound";
import { privatePage } from "./pages/private";
import { vpnPage } from "./pages/vpn";
import { reverseDns } from "./rdns";
import { llmsTxt, robotsTxt, securityTxt, sitemapXml } from "./seo";
import { type Env, SITE } from "./site";
import { readVisitor, toJson, type Visitor } from "./visitor";

// How long the API waits for the reverse DNS name before it gives up (hostname: null).
const JSON_RDNS_TIMEOUT_MS = 500;
const HOSTNAME_RDNS_TIMEOUT_MS = 2000;

const CSP = [
  "default-src 'none'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self' https://ipv4.icanhazip.com https://ipv6.icanhazip.com https://cloudflareinsights.com",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

const API_HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

/** Single values as plain text: /city, /asn and so on. */
const FIELDS: Record<string, (v: Visitor) => string | null> = {
  "/ip": (v) => v.ip,
  "/city": (v) => v.city,
  "/region": (v) => v.region,
  "/country": (v) => v.country,
  "/postal": (v) => v.postalCode,
  "/loc": (v) =>
    v.latitude !== null && v.longitude !== null ? `${v.latitude},${v.longitude}` : null,
  "/timezone": (v) => v.timezone,
  "/asn": (v) => (v.asn ? `AS${v.asn}` : null),
  "/org": (v) => v.org,
  "/ua": (v) => v.userAgent || null,
};

const PAGES: Record<string, (v: Visitor, request: Request) => Page> = {
  "/": homePage,
  "/ipv6": ipv6Page,
  "/location": locationPage,
  "/vpn-check": vpnPage,
  "/public-vs-private-ip": privatePage,
  "/headers": (_v, request) => headersPage(request),
  "/api": apiPage,
};

function text(body: string, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: { ...API_HEADERS, "content-type": "text/plain; charset=utf-8", ...extra },
  });
}

function json(data: unknown, extra: Record<string, string> = {}): Response {
  return new Response(`${JSON.stringify(data, null, 2)}\n`, {
    headers: { ...API_HEADERS, "content-type": "application/json; charset=utf-8", ...extra },
  });
}

function page(p: Page, env: Env, extra: Record<string, string> = {}): Response {
  return new Response(renderPage(p, env.ANALYTICS_TOKEN), {
    status: p.status ?? 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": CSP,
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      "strict-transport-security": "max-age=63072000; includeSubDomains",
      ...extra,
    },
  });
}

function file(body: string, type: string): Response {
  return new Response(body, {
    headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "public, max-age=3600" },
  });
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // "/ipv6/" → "/ipv6", so each page has exactly one address.
  if (path.length > 1 && path.endsWith("/")) {
    url.pathname = path.replace(/\/+$/, "") || "/";
    return Response.redirect(url.toString(), 301);
  }
  if (path === "/index.html") return Response.redirect(new URL("/", url).toString(), 301);

  const visitor = readVisitor(request);
  const noIndexApi = { "x-robots-tag": "noindex" };

  const field = FIELDS[path];
  if (field) {
    const value = field(visitor);
    return value ? text(`${value}\n`, 200, noIndexApi) : text("", 404, noIndexApi);
  }

  switch (path) {
    case "/json": {
      const hostname = await reverseDns(visitor.ip, JSON_RDNS_TIMEOUT_MS);
      return json(toJson(visitor, hostname), noIndexApi);
    }
    case "/hostname": {
      const hostname = await reverseDns(visitor.ip, HOSTNAME_RDNS_TIMEOUT_MS);
      return hostname ? text(`${hostname}\n`, 200, noIndexApi) : text("", 404, noIndexApi);
    }
    case "/robots.txt":
      return file(robotsTxt(), "text/plain");
    case "/sitemap.xml":
      return file(sitemapXml(), "application/xml");
    case "/llms.txt":
      return file(llmsTxt(), "text/plain");
    case "/.well-known/security.txt":
      return file(securityTxt(), "text/plain");
  }

  const format = pickFormat(request);
  const vary = { vary: "Accept, User-Agent" };

  // Browsers never use http:// here (.dev forces HTTPS), but old links and crawlers might.
  // Scripts keep working over http://, like `curl ip.tooljar.dev`. Cloudflare's CF-Visitor
  // header says which scheme the visitor really used (local dev doesn't send it).
  if (format === "html" && /"scheme":"http"/.test(request.headers.get("cf-visitor") ?? "")) {
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  if (path === "/" && format !== "html") {
    return format === "json"
      ? json(toJson(visitor, await reverseDns(visitor.ip, JSON_RDNS_TIMEOUT_MS)), vary)
      : text(`${visitor.ip}\n`, 200, vary);
  }
  if (path === "/headers" && format !== "html") {
    return json(Object.fromEntries(visibleHeaders(request.headers)), { ...vary, ...noIndexApi });
  }

  const build = PAGES[path];
  if (build)
    return page(build(visitor, request), env, path === "/" || path === "/headers" ? vary : {});
  return format === "html" ? page(notFoundPage(path), env) : text("Not found\n", 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, HEAD, OPTIONS",
          "access-control-allow-headers": "*",
          "access-control-max-age": "86400",
        },
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return text("Method not allowed\n", 405, { allow: "GET, HEAD, OPTIONS" });
    }

    const response = await route(request, env);

    // Copies of the site on other addresses (local dev, previews) stay out of search results.
    const headers = new Headers(response.headers);
    if (new URL(request.url).hostname !== SITE.host) headers.set("x-robots-tag", "noindex");
    return new Response(request.method === "HEAD" ? null : response.body, {
      status: response.status,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
