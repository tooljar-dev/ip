@AGENTS.md

# Claude Code — extra notes

The shared rules are in `AGENTS.md` (imported above). This part is only for Claude Code.

- **Browser:** Playwright screenshots go to `~/.cache/playwright-mcp`, never the repo.
- **Cloudflare:** the API token is in the `CLOUDFLARE_API_TOKEN` user environment variable. It can deploy Workers and edit DNS, but can't create Web Analytics sites (BROWSER step for Saba).
