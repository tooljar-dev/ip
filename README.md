# tooljar IP: what is my IP?

**https://ip.tooljar.dev** shows your public IP address, and gives scripts a free API for it.

```console
$ curl ip.tooljar.dev
203.0.113.42
```

- **Fast.** One small Cloudflare Worker answers at the edge, close to you. The IP is part of the HTML, not loaded afterwards.
- **Useful.** IPv4 and IPv6, rough location, internet provider (ASN), reverse DNS, browser, plus a VPN and WebRTC leak check.
- **Free API.** No key, no sign-up, CORS on, stable field names.
- **Private.** We don't store your IP. No cookies, no ads.

## API

| Address                                                                                   | Returns                                                                |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `ip.tooljar.dev`                                                                          | Your IP as plain text for curl and scripts (browsers get the web page) |
| `ip.tooljar.dev/ip`                                                                       | Your IP as plain text, always                                          |
| `ip.tooljar.dev/json`                                                                     | All fields as JSON                                                     |
| `/city` `/region` `/country` `/postal` `/loc` `/timezone` `/asn` `/org` `/hostname` `/ua` | One value as plain text                                                |
| `ip.tooljar.dev/headers`                                                                  | Your request headers as JSON (browsers get a page)                     |

Text answers end with a new line. When a value is not known, the address answers `404` with an empty body, so `curl -f` fails cleanly. Plain `http://` works too, for old scripts and routers.

```console
$ curl ip.tooljar.dev/json
{
  "ip": "203.0.113.42",
  "version": 4,
  "hostname": "host-42.example.net",
  "city": "Berlin",
  "region": "Land Berlin",
  "region_code": "BE",
  "country": "DE",
  "country_name": "Germany",
  "continent": "EU",
  "postal_code": "10115",
  "latitude": 52.52,
  "longitude": 13.405,
  "timezone": "Europe/Berlin",
  "asn": 64500,
  "org": "Example Telecom",
  "is_eu": true,
  "user_agent": "curl/8.22.0"
}
```

Any field we can't fill is `null`. `hostname` is `null` when the IP has no reverse DNS name, or when the lookup takes longer than half a second. Fields may be added later; existing ones will not be renamed or removed.

### Examples

```sh
# Shell
IP=$(curl -s ip.tooljar.dev)

# Ask for IPv4 or IPv6 on purpose
curl -4 ip.tooljar.dev
curl -6 ip.tooljar.dev

# JSON from the home address
curl -H "Accept: application/json" ip.tooljar.dev
```

```js
// Browser or Node.js
const { ip, country } = await (await fetch("https://ip.tooljar.dev/json")).json();
```

```python
import requests
print(requests.get("https://ip.tooljar.dev/json", timeout=5).json()["ip"])
```

```powershell
(Invoke-RestMethod https://ip.tooljar.dev/json).ip
```

**Fair use:** fetch your IP when you need it, not in a tight loop. A burst of many requests from one address gets `429 Too Many Requests` for a few seconds.

**Only your own IP:** the API answers about the IP that calls it. There is no lookup of other IPs, because the location data comes from Cloudflare with each request, not from a database.

## How it works

- Cloudflare puts the visitor's IP in the `CF-Connecting-IP` header and location and network data in [`request.cf`](https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties). The Worker turns that into a page, text or JSON.
- A connection uses either IPv4 or IPv6, so the server only sees one. The page asks [icanhazip](https://icanhazip.com) (run by Cloudflare) on its IPv4-only or IPv6-only address to show the other one.
- Reverse DNS comes from Cloudflare's public resolver, through DNS over HTTPS.
- The VPN check compares your IP's network and time zone with your device, and asks the browser which IP WebRTC would share (using Cloudflare's STUN server).

## Why there is no npm package or MCP server

Getting your IP is already one line: `curl ip.tooljar.dev`, or `fetch("https://ip.tooljar.dev/json")` in code. For Node.js, [`public-ip`](https://www.npmjs.com/package/public-ip) already does this well. A hosted MCP server would see the AI provider's server IP, not yours. So instead there is a clear API and an [`/llms.txt`](https://ip.tooljar.dev/llms.txt) for AI tools.

## Run your own copy

You need a Cloudflare account and Node.js 20 or newer.

```sh
npm install
npm run dev        # local copy on http://localhost:8787
npm run check      # lint, types, tests and a deploy dry run
```

To deploy on your own domain, change `routes` in `wrangler.jsonc` and `SITE` in `src/site.ts`, then run `npx wrangler deploy --config wrangler.jsonc`.

| Path             | What it is                                                          |
| ---------------- | ------------------------------------------------------------------- |
| `src/index.ts`   | The router: which address returns what                              |
| `src/pages/`     | The HTML pages                                                      |
| `src/visitor.ts` | Reads the IP and location from the request; the JSON shape          |
| `public/`        | Static files: `app.js` (copy buttons, IPv4/IPv6, VPN checks), icons |
| `test/`          | Tests that run inside the Workers runtime                           |

## License

MIT. Part of tooljar.dev: small, free, open-source tools.
