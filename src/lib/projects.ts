import type { CollectionEntry } from "astro:content";

export const PROJECT_CATEGORIES = [
  "offensive-security",
  "compliance",
  "other",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectEntry = CollectionEntry<"projects">;

export const categoryLabels: Record<ProjectCategory, string> = {
  "offensive-security": "Offensive Security",
  compliance: "Compliance",
  other: "Products and Apps",
};

export function sortProjectsByUpdatedDate(
  projects: ProjectEntry[],
): ProjectEntry[] {
  return [...projects].sort(
    (a, b) => b.data.updatedDate.valueOf() - a.data.updatedDate.valueOf(),
  );
}

export function sortProjectsByPublishedDate(
  projects: ProjectEntry[],
): ProjectEntry[] {
  return [...projects].sort((a, b) => {
    const publishedDiff =
      b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf();
    if (publishedDiff !== 0) return publishedDiff;

    const updatedDiff =
      b.data.updatedDate.valueOf() - a.data.updatedDate.valueOf();
    if (updatedDiff !== 0) return updatedDiff;

    return a.data.title.localeCompare(b.data.title);
  });
}

export function getProjectsByCategory(
  projects: ProjectEntry[],
  category: ProjectCategory,
): ProjectEntry[] {
  return sortProjectsByUpdatedDate(
    projects.filter((project) => project.data.category === category),
  );
}

export function getFeaturedProjects(projects: ProjectEntry[]): ProjectEntry[] {
  return sortProjectsByUpdatedDate(
    projects.filter((project) => project.data.featured),
  );
}

export function toProjectUrl(project: ProjectEntry): string {
  return `/projects/${project.id}`;
}

export function statusLabel(status: ProjectEntry["data"]["status"]): string {
  if (status === "active") return "Active";
  if (status === "maintained") return "Maintained";
  return "Archived";
}
