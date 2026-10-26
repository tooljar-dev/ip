// Makes public/world.svg, the small world map behind the "you are roughly here" dot.
// Run it only to change the map: `npm run map -- <path to ne_110m_land.geojson>`.
// Data: Natural Earth 1:110m land (public domain), from
// https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
// The projection is plain longitude/latitude, cut at 85°N and 65°S (no Antarctica).
// Keep NORTH, SOUTH and the size in sync with MAP in src/pages/parts.ts.
import { readFileSync, writeFileSync } from "node:fs";

const NORTH = 85;
const SOUTH = -65;
const WIDTH = 360;
const HEIGHT = NORTH - SOUTH;

const source = process.argv[2];
if (!source) {
  console.error("Usage: npm run map -- <path to ne_110m_land.geojson>");
  process.exit(1);
}
const land = JSON.parse(readFileSync(source, "utf8"));

// Whole map units: the map shows at about 320 px wide, so one unit is under one pixel.
const point = ([lon, lat]) => [
  Math.round(lon + 180),
  Math.round(NORTH - Math.max(SOUTH, Math.min(NORTH, lat))),
];

// Twice the area of a ring (shoelace formula); tiny islands vanish at this size.
const area2 = (points) =>
  Math.abs(
    points.reduce((sum, [x, y], i) => {
      const [nx, ny] = points[(i + 1) % points.length];
      return sum + x * ny - nx * y;
    }, 0),
  );

let path = "";
for (const feature of land.features) {
  const { type, coordinates } = feature.geometry;
  const polygons = type === "Polygon" ? [coordinates] : coordinates;
  for (const polygon of polygons) {
    const ring = polygon[0];
    // Skip Antarctica (its tip reaches 63°S, so test well north of the cut).
    if (ring.every(([, lat]) => lat < -55)) continue;
    const points = [];
    for (const p of ring.map(point)) {
      const last = points.at(-1);
      if (!last || last[0] !== p[0] || last[1] !== p[1]) points.push(p);
    }
    if (points.length < 4 || area2(points) < 4) continue;
    path += `M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}"><title>World map</title><style>path{fill:#0f766e;fill-opacity:.2}@media (prefers-color-scheme:dark){path{fill:#5eead4;fill-opacity:.18}}</style><path d="${path}"/></svg>
`;
writeFileSync(new URL("../public/world.svg", import.meta.url), svg);
console.log(`public/world.svg: ${svg.length} bytes`);
