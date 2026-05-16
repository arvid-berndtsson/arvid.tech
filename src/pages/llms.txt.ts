import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { toBlogSlug } from "../lib/content-slugs";

const FALLBACK_SITE_URL = "https://arvid.tech";
const MAX_THOUGHTS = 20;
const MAX_PROJECTS = 15;

function toAbsolute(site: URL | undefined, routePath: string): string {
  return new URL(routePath, site ?? FALLBACK_SITE_URL).toString();
}

export const GET: APIRoute = async ({ site }) => {
  const posts = ((await getCollection("blog")) as CollectionEntry<"blog">[])
    .sort(
      (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
        b.data.date.getTime() - a.data.date.getTime(),
    )
    .slice(0, MAX_THOUGHTS);

  const projects = (
    (await getCollection("projects")) as CollectionEntry<"projects">[]
  )
    .sort(
      (a: CollectionEntry<"projects">, b: CollectionEntry<"projects">) =>
        b.data.updatedDate.getTime() - a.data.updatedDate.getTime(),
    )
    .slice(0, MAX_PROJECTS);

  const lines: string[] = [
    "# arvid.tech",
    "",
    "> Personal website of Arvid Berndtsson. Focus: information security leadership, software engineering, technical writing, and portfolio projects.",
    "",
    "Use canonical URLs from this file when citing the site.",
    "",
    "## Primary Pages",
    `- [Home](${toAbsolute(site, "/")}): Landing page and navigation hub`,
    `- [About](${toAbsolute(site, "/about")}): Background, focus areas, and contact context`,
    `- [Blog](${toAbsolute(site, "/blog")}): Writing archive`,
    `- [Projects](${toAbsolute(site, "/projects")}): Project portfolio`,
    `- [Security Research](${toAbsolute(site, "/security-research")}): Security-focused writing index`,
    `- [Contact](${toAbsolute(site, "/contact")}): Contact paths`,
    "",
    "## Machine-Readable Endpoints",
    `- [Sitemap](${toAbsolute(site, "/sitemap-index.xml")}): Canonical URL inventory`,
    `- [RSS](${toAbsolute(site, "/rss.xml")}): Latest blog posts`,
    `- [Blog Markdown Index](${toAbsolute(site, "/blog.md")}): Markdown index of posts`,
    `- [Home Markdown](${toAbsolute(site, "/index.md")}): Markdown summary of site`,
    `- [About Markdown](${toAbsolute(site, "/about.md")}): Markdown about page`,
    "",
    "Each blog post also has a raw markdown endpoint by appending `.md` to the post URL (example: `/blog/<slug>.md`).",
    "",
    "## Latest Blog Posts",
  ];

  for (const post of posts) {
    const summary =
      post.data.summary ?? post.data.excerpt ?? "No summary provided.";
    lines.push(
      `- [${post.data.title}](${toAbsolute(site, `/blog/${toBlogSlug(post.id)}`)}): ${summary}`,
    );
  }

  lines.push("", "## Recent Projects");

  for (const project of projects) {
    lines.push(
      `- [${project.data.title}](${toAbsolute(site, `/projects/${project.id}`)}): ${project.data.summary}`,
    );
  }

  lines.push(
    "",
    "## Optional",
    `- [Tags](${toAbsolute(site, "/tags")}): Topic taxonomy across blog posts, projects, and experiences`,
    `- [Experiences](${toAbsolute(site, "/experiences")}): Career timeline`,
  );

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
