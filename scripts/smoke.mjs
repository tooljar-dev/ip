// Checks a running copy of the site from the outside, like a visitor would.
// Usage: `npm run smoke` (live site) or `node scripts/smoke.mjs http://127.0.0.1:8787`.
const base = (process.argv[2] ?? "https://ip.tooljar.dev").replace(/\/$/, "");
const BROWSER = {
  accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/141.0.0.0 Safari/537.36",
};
const CURL = { accept: "*/*", "user-agent": "curl/8.22.0" };
const IP = /^(\d{1,3}(\.\d{1,3}){3}|[0-9a-f:]+)\n$/i;

let failures = 0;
function check(name, ok, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

async function get(path, headers = CURL, url = `${base}${path}`) {
  const started = Date.now();
  const res = await fetch(url, { headers, redirect: "manual" });
  const body = await res.text();
  return { res, body, ms: Date.now() - started };
}

const home = await get("/");
check("curl / prints only the IP", home.res.status === 200 && IP.test(home.body), `${home.ms} ms`);

const json = await get("/json");
let data = {};
try {
  data = JSON.parse(json.body);
} catch {}
check(
  "/json returns JSON with the IP",
  typeof data.ip === "string",
  `${json.ms} ms, ip=${data.ip}`,
);
check(
  "/json allows any website (CORS)",
  json.res.headers.get("access-control-allow-origin") === "*",
);
check("/json has location data", Boolean(data.country), `country=${data.country}, org=${data.org}`);

for (const path of [
  "/",
  "/ipv6",
  "/location",
  "/vpn-check",
  "/public-vs-private-ip",
  "/headers",
  "/api",
]) {
  const page = await get(path, BROWSER);
  check(
    `page ${path}`,
    page.res.status === 200 &&
      page.body.includes(`<link rel="canonical" href="https://ip.tooljar.dev${path}">`) &&
      Boolean(page.res.headers.get("content-security-policy")),
    `${page.ms} ms`,
  );
}

const missing = await get("/no-such-page", BROWSER);
check("unknown page gives 404", missing.res.status === 404);

const robots = await get("/robots.txt");
check(
  "robots.txt points to the sitemap",
  robots.body.includes("Sitemap: https://ip.tooljar.dev/sitemap.xml"),
);
// Cloudflare's "managed robots.txt" can add AI-crawler blocks in front of ours.
check(
  "robots.txt has no blocks added by Cloudflare",
  !/Disallow: \/\s*$/m.test(robots.body) && !/Content-Signal/i.test(robots.body),
);
check("sitemap.xml", (await get("/sitemap.xml")).body.includes("<urlset"));
check("llms.txt", (await get("/llms.txt")).body.startsWith("# tooljar IP"));

for (const [path, type] of [
  ["/app.js", "javascript"],
  ["/og.png", "image/png"],
  ["/favicon.svg", "image/svg+xml"],
  ["/favicon.ico", "icon"],
]) {
  const asset = await get(path);
  check(
    `file ${path}`,
    asset.res.status === 200 && (asset.res.headers.get("content-type") ?? "").includes(type),
  );
}

if (base.startsWith("https://")) {
  const httpBase = base.replace("https://", "http://");
  const plain = await get("", CURL, `${httpBase}/`);
  check("curl over plain http still works", plain.res.status === 200 && IP.test(plain.body));
  const redirect = await get("", BROWSER, `${httpBase}/`);
  check(
    "browsers on http move to https",
    redirect.res.status === 301,
    redirect.res.headers.get("location") ?? "",
  );
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
