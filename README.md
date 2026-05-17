# arvid.tech

This is the source code for [arvid.tech](https://arvid.tech), the personal website, portfolio, writing archive, and public knowledge base of [Arvid Berndtsson](https://arvid.tech/about). The project exists to keep Arvid's work visible and easy to understand: what he builds, what he writes about, what he is learning, and how his technical and security work has developed over time.

The site is not only a portfolio page. It is a long-running personal web project that has changed shape many times, from early iWeb and WordPress sites to HTML, jQuery, React, Next.js, Svelte, Qwik, Ghost, and now Astro. That history matters because the project is also a practical place to test content architecture, performance, search, accessibility, AI discovery, Cloudflare deployment, and file-based publishing workflows in a real production site.

The repository is public on purpose. The website is already public, and keeping the source open makes the content, structure, project history, and implementation easier to inspect by people, search engines, AI tools, and future contributors. It also fits the way the site is maintained: content lives close to the code, changes are versioned, and the repository acts as a lightweight CMS.

## The Project

`arvid.tech` is built with Astro, TypeScript, MDX content collections, Tailwind CSS, selective React islands, Pagefind search, and Cloudflare Pages. The site publishes Arvid's blog, project archive, professional experience, recommendations, security research, tags, and machine-readable pages for systems that prefer structured Markdown or plain text.

The most important content lives in `content/`, where blog posts, projects, experiences, education, certifications, volunteering, and milestones are stored as Markdown or MDX. The schemas for those collections are defined in [`src/content.config.ts`](src/content.config.ts), which keeps the content model predictable and catches missing or incorrect fields during checks. Shared site configuration lives in [`src/config/site.ts`](src/config/site.ts), while reusable data such as skills, recommendations, and mentions lives in `data/`.

The site also exposes AI- and search-friendly endpoints. [`/llms.txt`](https://arvid.tech/llms.txt) gives a structured summary of the site, [`/index.md`](https://arvid.tech/index.md) and [`/about.md`](https://arvid.tech/about.md) provide Markdown versions of key pages, [`/blog.md`](https://arvid.tech/blog.md) indexes posts, [`/rss.xml`](https://arvid.tech/rss.xml) publishes the RSS feed, and [`/sitemap-index.xml`](https://arvid.tech/sitemap-index.xml) provides the canonical sitemap index.

## Professional Context

The site is also meant to reflect Arvid's current work as Head of Information Security at Vertiseit Group. His role sits between governance, compliance, secure development, customer trust, technical security, incident readiness, and AI governance. A recurring theme in the work is turning security requirements into systems and habits that product, engineering, IT, HR, leadership, and customer-facing teams can actually use.

During his first year in the role, Arvid has worked across ISO 27001, SOC 2 Type II, TISAX readiness, policy adoption, evidence collection, vendor assessments, access reviews, secure development workflows, customer security questionnaires, incident tabletop exercises, backup testing, Microsoft security configuration, endpoint compliance, vulnerability remediation, and AI governance. The role has also included practical work around security training, phishing awareness, background screening, customer-facing trust material, repository migration to GitHub, status pages, ChatGPT configuration, and authentication patterns for AI-assisted applications.

That breadth is why the website talks about security in a practical way. The goal is not to present security as a separate policy layer, but as something that should connect to engineering workflows, customer expectations, operational resilience, and the way modern teams actually build software.

## Working Locally

The project uses `mise` for the local toolchain and `pnpm` for package management. After cloning the repository, install the pinned tools and dependencies, then start Astro's development server.

```bash
git clone git@github.com:arvid-berndtsson/arvid.tech.git
cd arvid.tech

mise install
pnpm install
pnpm dev
```

The local development server runs at [http://localhost:4321](http://localhost:4321).

The most common development commands are `pnpm dev` for local work, `pnpm build` for production builds, `pnpm content:check` for Astro and content validation, `pnpm test` for the Playwright test suite, `pnpm preview` for a Cloudflare Pages-style local preview, and `pnpm deploy:cf` for deploying to Cloudflare Pages.

## Content And Deployment

Most edits to the site are content edits. Blog posts, project pages, experience entries, and background material are written as MDX files in `content/`, then validated through Astro's content collection schemas. Images can be placed next to the content file that uses them; the current image handling workflow is described in [`CONTRIBUTING.md`](CONTRIBUTING.md).

The production site is configured for Cloudflare Pages through [`wrangler.jsonc`](wrangler.jsonc). A production build can be created with `pnpm build`, previewed locally with `pnpm preview`, and deployed with `pnpm deploy:cf`.

## Why This Repository Matters

This repository is the working record behind the public site. It documents the project itself, but it also gives context to Arvid's security work, writing, products, experiments, and professional development. The site should make it easier to understand not only what has been built, but why it was built, how it changed, and what kind of problems Arvid tends to care about.
