# tooljar IP — Agent Instructions

The "what is my IP" site and free API at **https://ip.tooljar.dev**: one Cloudflare Worker (TypeScript, no framework) that renders the visitor's IP, location and network on the server, plus a few long-tail guide pages. The first tool of tooljar.dev. Public, MIT-licensed repo.

**This file is shared by every AI agent.** Claude Code reads it through `CLAUDE.md`. Codex reads it directly.

**Shared rules for all projects (maintainer's workspace):** `../../_shared/README.md`. Before social media, Codex, video or browser work, read the matching file in `_shared/playbooks/`. 🔒 Locks there can't be overridden here.

## Start of every session

1. Read `../STATUS.md` (the project tracker; it lives outside this public repo on purpose).
2. Run `git status`. It should be clean, or match what `STATUS.md` says.

## End of every session

1. Update `../STATUS.md` (log + open problems + next steps).
2. Commit with the repo's commit style (see "Rules").
3. Ask Saba before pushing and before every deploy.

## Where things live

| Path                      | What it is                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `src/index.ts`            | Router: which address returns what, response headers (CSP, CORS, caching)               |
| `src/negotiate.ts`        | Who gets the page and who gets plain text / JSON                                        |
| `src/visitor.ts`          | Reads IP + `request.cf`; the public JSON shape (`toJson`)                               |
| `src/network.ts`          | Network type: Tor (Cloudflare's `T1`), relay / hosting ASN lists, owner-name fallback   |
| `src/pages/`              | HTML pages; `parts.ts` has the shared blocks and FAQ/structured data helpers            |
| `src/layout.ts`           | `<head>` (SEO tags), header, footer, all CSS                                            |
| `src/seo.ts`              | `PAGE_PATHS`, robots.txt, sitemap.xml, llms.txt, security.txt                           |
| `public/`                 | Static files served before the Worker: `app.js`, icons, `og.png`, the IndexNow key file |
| `scripts/make-images.mjs` | Rebuilds the PNG icons and `og.png`                                                     |
| `scripts/make-map.mjs`    | Rebuilds `public/world.svg` from Natural Earth land data (public domain)                |
| `scripts/smoke.mjs`       | Live checks against a running copy                                                      |
| `test/`                   | Vitest tests that run inside workerd                                                    |

## Run, check, deploy

- `npm install`: once per machine. Dependencies don't sync between the PC and the Mac.
- `npm run dev`: local copy (real location data from Cloudflare; your IP shows as 127.0.0.1).
- `npm run check`: Biome lint, TypeScript, tests, deploy dry run. Run it before saying a code task is done.
- **Deploy** (only with Saba's OK): from this folder, `npm run cf:dry`, read the file list, then `npx wrangler deploy --config wrangler.jsonc`. Then `npm run smoke`.
- Auth: wrangler uses the `CLOUDFLARE_API_TOKEN` user environment variable.

## Rules

- **Commits:** one line `type(scope): summary` (`feature`, `bugfix`, `refactor`, `docs`, `chore`), no body.
- **API is a product:** paths and JSON field names are stable. Add fields, never rename or remove them. Update `README.md`, `src/pages/api.ts` and `llms.txt` together.
- **Every value in a page goes through the `html` template tag** (auto-escaped). Use `raw()` only for strings we wrote ourselves.
- **New page:** add it to `PAGES` in `src/index.ts`, to `PAGE_PATHS` in `src/seo.ts`, to `GUIDES` in `src/pages/parts.ts` if it is a guide (the privacy page isn't; it sits in the footer), add it to `scripts/smoke.mjs`, and bump `SITE.updated` when page texts change.
- **Network lists (`src/network.ts`):** add an ASN only after checking its registered owner (RIPEstat: `https://stat.ripe.net/data/as-overview/data.json?resource=AS<number>`). Never add one by name alone, and never copy lists from other projects' private code. Only Tor may be called certain; everything else is an "estimate" in the texts.
- **Privacy texts:** `/privacy`, the footer line and the home FAQ must stay true. If you add logging, a new third-party request or analytics, update them first and ask Saba.
- **Privacy promise:** the site says it doesn't store IPs. Don't add logging, Workers Logs or analytics that store IPs without changing that text and asking Saba.
- **Plain, simple words** in all docs and page texts.

## Overrides of the shared rules

- **Sentry: not used** (2026-10-25). A tiny stateless Worker; errors show in `wrangler tail`. Revisit if the API gets real traffic.
- **`STATUS.md` lives outside the repo** (`../STATUS.md`), because this repo is public (same as driftmark).
