import type { APIRoute } from "astro";

const FALLBACK_SITE_URL = "https://arvid.tech";

function toAbsolute(site: URL | undefined, routePath: string): string {
  return new URL(routePath, site ?? FALLBACK_SITE_URL).toString();
}

export const GET: APIRoute = ({ site }) => {
  const lines = [
    "# General crawl policy",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "# AI search visibility: allow search index bots",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: Claude-SearchBot",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "# AI model training policy: block training crawlers",
    "User-agent: GPTBot",
    "Disallow: /",
    "",
    "User-agent: ClaudeBot",
    "Disallow: /",
    "",
    "User-agent: Google-Extended",
    "Disallow: /",
    "",
    `Sitemap: ${toAbsolute(site, "/sitemap-index.xml")}`,
    `Sitemap: ${toAbsolute(site, "/rss.xml")}`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
