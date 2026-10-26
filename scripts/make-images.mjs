// Makes the PNG icons, favicon.ico and the link-preview image (og.png) in public/.
// Run it after changing the logo or the preview text: `npm run images`.
import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const pub = new URL("../public/", import.meta.url);
const logo = readFileSync(new URL("favicon.svg", pub), "utf8");

function png(svg, width) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
  })
    .render()
    .asPng();
}

// An .ico file may hold a PNG image directly (supported since Windows Vista).
function ico(pngBytes, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(pngBytes.length, 14);
  header.writeUInt32LE(22, 18); // image data starts after this header
  return Buffer.concat([header, pngBytes]);
}

const touchIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="#fdf8f1"/><g transform="translate(26 22) scale(4)">${logo.replace(/<\/?svg[^>]*>/g, "")}</g></svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde8bf"/><stop offset="1" stop-color="#fff4e3"/></linearGradient></defs>
<rect width="1200" height="630" fill="#fdf8f1"/>
<rect x="60" y="60" width="1080" height="510" rx="44" fill="url(#g)" stroke="#ecdfcb" stroke-width="2"/>
<g transform="translate(120 120) scale(3)">${logo.replace(/<\/?svg[^>]*>/g, "")}</g>
<text x="230" y="178" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="800" fill="#1d2433">tooljar</text>
<rect x="408" y="138" width="78" height="52" rx="26" fill="#0f766e"/>
<text x="447" y="176" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="800" fill="#ffffff">IP</text>
<text x="120" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="76" font-weight="800" fill="#1d2433">What is my IP address?</text>
<text x="120" y="400" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#566072">Your IPv4 and IPv6, location and provider. Free, no ads.</text>
<rect x="120" y="440" width="470" height="70" rx="18" fill="#1d2433"/>
<text x="150" y="486" font-family="Cascadia Code, Consolas, monospace" font-size="32" font-weight="600" fill="#f6efe4">$ curl ip.tooljar.dev</text>
</svg>`;

writeFileSync(new URL("favicon-32.png", pub), png(logo, 32));
writeFileSync(new URL("favicon.ico", pub), ico(png(logo, 32), 32));
writeFileSync(new URL("apple-touch-icon.png", pub), png(touchIcon, 180));
writeFileSync(new URL("og.png", pub), png(og, 1200));
console.log("Wrote favicon-32.png, favicon.ico, apple-touch-icon.png and og.png in public/.");
