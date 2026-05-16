import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import type { CollectionEntry } from "astro:content";
import { toBlogSlug } from "../lib/content-slugs";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const sortedPosts = posts.sort(
    (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
      b.data.date.valueOf() - a.data.date.valueOf(),
  );

  let markdownContent = "# Blog\n\n";
  markdownContent += `Total posts: ${sortedPosts.length}\n\n`;

  for (const post of sortedPosts) {
    markdownContent += `- ${formatDate(post.data.date)}: [${post.data.title}](/blog/${toBlogSlug(post.id)}.md)\n`;
  }

  markdownContent += "\n---\n\n";
  markdownContent += "[Back to home](/index.md)\n";

  return new Response(markdownContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
