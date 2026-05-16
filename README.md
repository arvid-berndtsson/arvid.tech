# arvid.tech – Personal Website

**Status:** Migrated to Astro · Edge-ready · Deployed via Cloudflare Pages

A fast, fully-typed, SEO-focused personal site for Arvid Berndtsson. Built with **Astro 5**, Tailwind CSS v4, MDX, and Astro Content Collections—running at the edge on Cloudflare Pages.

---

## ✨ Key Features

| Area      | Details                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------ |
| Framework | **Astro 5** (Server-Side Rendering, Content Collections, React Islands)                          |
| Language  | TypeScript strict + React 19 (for interactive components)                                        |
| Styling   | Tailwind CSS v4 with PostCSS                                                                     |
| Content   | MDX files with Astro Content Collections ➜ Type-safe schemas ➜ SSR pages                         |
| Sections  | Blog, Projects, Experiences, plus LinkedIn-style Education, Skills, Certifications, Awards, etc. |
| Taxonomy  | Global tag system across posts/projects/experiences                                              |
| Analytics | Cloudflare Analytics Engine + Umami (self-hosted)                                                |
| Caching   | R2 for assets, KV for data storage                                                               |
| i18n      | English (default)                                                                                |
| CI / CD   | GitHub → Cloudflare Pages via Wrangler                                                           |
| Tooling   | pnpm, mise (task runner & version manager), Prettier, ESLint                                     |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install mise (https://mise.jdx.dev)
curl https://mise.jdx.dev/install.sh | bash
# Enable Corepack & pnpm
corepack enable && corepack prepare pnpm@latest --activate
# Clone the repo
pnpm dlx degit arvid-berndtsson/arvid-tech
cd arvid-tech
```

### Install & Run

```bash
# Install Node 24 and project deps
mise use node@24
pnpm install

# Start Astro dev server
pnpm dev
# or
astro dev
```

Visit http://localhost:4321. Hot-reloads with Vite HMR.

---

## 🗂 Directory Layout

```
.
├── src/
│   ├── pages/           # Astro pages (routes)
│   │   ├── index.astro  # Homepage
│   │   └── thoughts/    # Blog pages
│   ├── layouts/         # Layout components
│   ├── content/         # Content Collections (symlinked to /content)
│   └── styles.css       # Global styles (Tailwind CSS)
├── content/             # MDX content files
│   ├── thoughts/
│   ├── projects/
│   └── experiences/
├── public/              # Static assets
├── dist/                # Build output for Cloudflare Pages
└── ...
```

---

## 🛠️ Common Tasks

| Task          | Command              | Purpose                                                           |
| ------------- | -------------------- | ----------------------------------------------------------------- |
| dev           | `pnpm dev`           | Local dev with Astro + Vite HMR                                   |
| build         | `pnpm build`         | Production build for Cloudflare Pages                             |
| preview       | `pnpm start`         | Preview production build locally                                  |
| deploy        | `pnpm run deploy:cf` | Build and deploy to Cloudflare Pages                              |
| lint          | `pnpm lint`          | ESLint                                                            |
| test          | `pnpm test`          | Run E2E tests with Playwright                                     |
| test-a11y     | `pnpm test:a11y`     | Run accessibility tests (Playwright + axe)                        |
| content:lint  | `pnpm content:lint`  | Content lint: frontmatter presence + local link/image path checks |
| content:check | `pnpm content:check` | Astro content schema/type checks + content lint                   |
| ai:check      | `pnpm ai:check`      | Validate built `robots.txt`, `llms.txt`, and `rss.xml` outputs    |

**Pro-tip:** `mise run pre-commit` auto-runs on every commit via git hook, blocking bad diffs.

---

## 🧪 Testing

The project includes comprehensive testing with Playwright (E2E and accessibility via axe-core).

```bash
# Run all E2E tests
pnpm test

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run accessibility tests
pnpm test:a11y

# Test Cloudflare Pages deployment (dry-run)
pnpm test:wrangler

# Test locally with wrangler pages dev (Pages preview)
pnpm test:local
# or
mise run test-local

# View test report
pnpm test:report
```

**Test Coverage:**

- ✅ Home page rendering and SEO
- ✅ Blog listing and individual posts
- ✅ Site navigation and routing
- ✅ Responsive design (mobile + desktop)
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ External link security attributes
- ✅ Cloudflare Pages deployment validation
- ✅ Local Pages preview with `wrangler pages dev`

**Local Pages preview:**

The project includes a script to test the Cloudflare Pages build locally using `wrangler pages dev`:

```bash
# Start local Workers testing environment
pnpm test:local
# or
mise run test-local
```

This will:

1. Build the project for Cloudflare Pages (if needed)
2. Start `wrangler pages dev` on `http://localhost:8787`
3. Provide a local preview that matches production

The script automatically handles building, starting the server, and cleanup. Press `Ctrl+C` to stop.

**Testing with Playwright against local Pages:**

To run E2E tests against the local Pages preview:

```bash
# In one terminal: Start Pages preview
pnpm test:local

# In another terminal: Run tests against localhost:8787
PLAYWRIGHT_BASE_URL=http://localhost:8787 pnpm test
```

See [docs/TESTING.md](docs/TESTING.md) for detailed testing guide.

**Troubleshooting local Pages preview:**

- **Build fails**: Ensure all dependencies are installed with `pnpm install`
- **Wrangler not found**: Run `pnpm install` to ensure wrangler is available
- **Port 8787 already in use**: Stop any other process using that port, or modify the script to use a different port
- **Server doesn't start**: Check the console output for errors. Common issues: Wrangler authentication (run `wrangler login`), missing Cloudflare account configuration
- **Tests fail against localhost:8787**: Make sure `pnpm test:local` is running in another terminal before running tests

---

## 🔒 Security Posture

- All external links use `rel="noopener noreferrer"`.
- MDX content is build-time rendered; avoid raw HTML in content to reduce XSS surface.
- Dependabot alerts and `pnpm audit` run in CI.

---

## 🏗️ Deployment

Deploy to Cloudflare Pages:

1. Set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in GitHub Secrets (or your environment).
2. Build and deploy: `pnpm run deploy:cf` (or use your CI to run this on push to main).
3. Configure your domain in the Cloudflare Pages project so arvid.tech points to the Pages project.

See [Cloudflare Pages docs](https://developers.cloudflare.com/pages/) for setup and rollback (e.g. via dashboard or `wrangler pages deploy`).
