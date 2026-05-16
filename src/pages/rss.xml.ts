import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import { toBlogSlug } from "../lib/content-slugs";

const FALLBACK_SITE_URL = "https://arvid.tech";

export async function GET(context: { site?: URL }) {
  const posts: CollectionEntry<"blog">[] = await getCollection("blog");
  const sortedPosts = posts.sort(
    (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
      b.data.date.getTime() - a.data.date.getTime(),
  );

  return rss({
    title: "Arvid Berndtsson - Blog",
    description:
      "Security, engineering, and product thinking from Arvid Berndtsson.",
    site: context.site ?? FALLBACK_SITE_URL,
    items: sortedPosts.map((post: CollectionEntry<"blog">) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary ?? post.data.excerpt ?? "",
      link: `/blog/${toBlogSlug(post.id)}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
