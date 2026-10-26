// Turns a user-agent string (the browser's self-description) into "Chrome 141 on Windows".
// Small on purpose: it covers the common browsers and tools, and falls back to null.

export interface UaSummary {
  browser: string | null;
  os: string | null;
  device: "mobile" | "tablet" | "desktop" | null;
}

const BROWSERS: [RegExp, string][] = [
  [/\bEdg(?:e|A|iOS)?\/(\d+)/, "Edge"],
  [/\bOPR\/(\d+)/, "Opera"],
  [/\bSamsungBrowser\/(\d+)/, "Samsung Internet"],
  [/\bYaBrowser\/(\d+)/, "Yandex Browser"],
  [/\bVivaldi\/(\d+)/, "Vivaldi"],
  [/\b(?:Firefox|FxiOS)\/(\d+)/, "Firefox"],
  [/\b(?:Chrome|CriOS)\/(\d+)/, "Chrome"],
  [/\bVersion\/(\d+(?:\.\d+)?)[^ ]* (?:Mobile\/\S+ )?Safari\//, "Safari"],
  [/^curl\/([\d.]+)/, "curl"],
  [/^Wget\/([\d.]+)/, "Wget"],
  [/^HTTPie\/([\d.]+)/, "HTTPie"],
  [/\bPowerShell\/([\d.]+)/, "PowerShell"],
  [/^python-requests\/([\d.]+)/, "Python requests"],
  [/^Go-http-client\/([\d.]+)/, "Go"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Windows NT/, "Windows"],
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/CrOS/, "ChromeOS"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Linux/, "Linux"],
];

export function describeUserAgent(ua: string): UaSummary {
  let browser: string | null = null;
  for (const [pattern, name] of BROWSERS) {
    const match = ua.match(pattern);
    if (match) {
      browser = match[1] ? `${name} ${match[1]}` : name;
      break;
    }
  }
  const os = SYSTEMS.find(([pattern]) => pattern.test(ua))?.[1] ?? null;
  let device: UaSummary["device"] = null;
  if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) device = "tablet";
  else if (/Mobi|iPhone|iPod/.test(ua)) device = "mobile";
  else if (os) device = "desktop";
  return { browser, os, device };
}

export function uaLine(ua: string): string | null {
  const { browser, os } = describeUserAgent(ua);
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os;
}
