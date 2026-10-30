// Small line icons (24×24), drawn with the current text color.
import { type Html, raw } from "./html";

function icon(paths: string): Html {
  return raw(
    `<svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`,
  );
}

export const ICONS = {
  pin: icon(
    '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  ),
  globe: icon(
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  ),
  server: icon(
    '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  ),
  browser: icon(
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  ),
  lock: icon(
    '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  ),
  terminal: icon(
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  ),
  shield: icon(
    '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  ),
  list: icon('<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>'),
  six: icon(
    '<circle cx="12" cy="12" r="9"/><path d="M14.5 8.5a3.5 3.5 0 0 0-5.5 2.8V13a3 3 0 1 0 3-3"/>',
  ),
  home: icon('<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/>'),
  clock: icon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  plug: icon('<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5"/>'),
} as const;

// The same mark as public/favicon.svg, without its <style>: an inline <style> would apply to the
// whole page. The lid and jar take the theme colours from the page CSS (.logo-jar in layout.ts);
// the pointer stays dark ink in both themes. 32 px keeps every edge on a whole pixel.
export const JAR_LOGO = raw(
  '<svg class="logo-jar" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><rect class="lid" x="6" y="2" width="20" height="6" rx="3" fill="#0f766e"/><path class="jar" d="M8 10H24V12C24 14 30 13 30 18V24Q30 30 24 30H8Q2 30 2 24V18C2 13 8 14 8 12Z" fill="#f59e0b"/><path d="M12 12L24 24H20L22 28H18L16 24L12 28Z" fill="#1d2433"/></svg>',
);
