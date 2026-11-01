@AGENTS.md

# Claude Code — extra notes

The shared rules are in `AGENTS.md` (imported above). This part is only for Claude Code.

- **Browser:** Playwright screenshots go to `~/.cache/playwright-mcp`, never the repo.
- **Cloudflare:** this site is in the Cloudflare account "tooljar". Its API token is the `CLOUDFLARE_API_TOKEN_TOOLJAR` user environment variable (see "Run, check, deploy" in `AGENTS.md`). It can deploy Workers and edit DNS, the firewall, zone settings and email routing, but can't create Web Analytics sites (browser step).
- **Browser:** the Playwright profile `tooljar` is signed in to Cloudflare, Google Search Console and Bing Webmaster Tools.
