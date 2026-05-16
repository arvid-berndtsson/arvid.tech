import { getCollection, type CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";
import { assertUniqueBlogSlugs, toBlogSlug } from "../../lib/content-slugs";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  assertUniqueBlogSlugs(posts.map((post: CollectionEntry<"blog">) => post.id));

  return posts.map((post: CollectionEntry<"blog">) => ({
    params: { slug: toBlogSlug(post.id) },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: CollectionEntry<"blog"> };
  const rawContent = post.body;

  return new Response(rawContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
