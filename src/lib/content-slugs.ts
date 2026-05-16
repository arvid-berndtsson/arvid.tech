export function toBlogSlug(id: string): string {
  const normalized = id.replace(/\\/g, "/").replace(/\.(md|mdx)$/i, "");
  const withoutIndex = normalized.replace(/\/index$/i, "");
  const parts = withoutIndex.split("/").filter(Boolean);
  return parts.at(-1) ?? withoutIndex;
}

export function assertUniqueBlogSlugs(ids: string[]): void {
  const seen = new Map<string, string>();

  for (const id of ids) {
    const slug = toBlogSlug(id);
    const existing = seen.get(slug);

    if (existing && existing !== id) {
      throw new Error(
        `Duplicate blog slug "${slug}" from "${existing}" and "${id}". ` +
          "Use unique folder/file names under content/blog.",
      );
    }

    seen.set(slug, id);
  }
}
