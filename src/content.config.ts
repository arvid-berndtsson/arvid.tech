import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      author: z.union([z.string(), z.array(z.string())]).optional(),
      rootPage: z.string().optional(),
      sidebar: z.string().optional(),
      showTitle: z.boolean().optional(),
      hideAnchor: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
      excerpt: z.string().optional(),
      summary: z.string().optional(),
      coverImage: z.union([z.string(), image()]).optional(),
      featuredImage: z.union([z.string(), image()]).optional(),
      featuredImageType: z.string().optional(),
      featuredImageCaption: z.string().optional(),
      coverImageAlt: z.string().optional(),
      coverImageCreditName: z.string().optional(),
      coverImageCreditUrl: z.string().optional(),
      readingTime: z.number().optional(),
      noindex: z.boolean().optional(),
    }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    category: z.enum(["offensive-security", "compliance", "other"]),
    tags: z.array(z.string()),
    status: z.enum(["active", "maintained", "archived"]),
    language: z.string(),
    repoUrl: z.string().optional(),
    docsUrl: z.string().optional(),
    demoUrl: z.string().optional(),
    publishedDate: z.date(),
    updatedDate: z.date(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    noindex: z.boolean().optional(),
    featured: z.boolean().optional().default(false),
    problem: z.string(),
    whatItDoes: z.array(z.string()),
    useCases: z.array(z.string()),
    stackArchitecture: z.array(z.string()),
    roadmap: z.array(z.string()),
    relatedResearch: z.array(reference("blog")).optional(),
  }),
});

const experiencesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/experiences" }),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    noindex: z.boolean().optional(),
  }),
});

const educationCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/education" }),
  schema: z.object({
    degree: z.string(),
    institution: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
});

const certificationsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/certifications" }),
  schema: z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.date(),
    expiryDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
});

const volunteeringCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/volunteering" }),
  schema: z.object({
    role: z.string(),
    organization: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
});

const milestonesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/milestones" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    summary: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
  experiences: experiencesCollection,
  education: educationCollection,
  certifications: certificationsCollection,
  volunteering: volunteeringCollection,
  milestones: milestonesCollection,
};
