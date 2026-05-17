# Contributing

Thanks for helping improve arvid.tech. The site is an Astro project deployed to
Cloudflare Pages, with content stored as MDX under `content/`.

## Local Setup

Use the versions pinned in `mise.toml`.

```bash
mise install
pnpm install
pnpm dev
```

The local Astro dev server runs at `http://localhost:4321`.

## Useful Commands

```bash
pnpm lint
pnpm build
pnpm run scripts:test
pnpm content:check
pnpm test:e2e
pnpm test:local
```

Run the smallest relevant checks before opening a pull request. Content-only
changes should pass `pnpm content:check`. Code changes should usually pass
`pnpm lint`, `pnpm run scripts:test`, and `pnpm build`. UI, routing, or
accessibility changes should also run the relevant Playwright tests.

## Content Structure

Blog posts live directly under `content/blog/` as flat `.md` or `.mdx` files.
Do not create nested blog folders.

Project, experience, education, certification, volunteering, and milestone
entries also live under `content/` and must match the schemas in
`src/content.config.ts`.

All content files must include frontmatter. The content checker also validates
local links, local image references, and trailing whitespace.

## Images

Do not commit image files under `content/`. The current checks fail image
binaries in that directory, including screenshots placed next to an MDX file.

For blog `coverImage` and `featuredImage` values, use an `http://` or
`https://` URL. If the image is owned by this site, upload it manually first and
reference the hosted `https://files.arvid.tech/...` URL. External image URLs are
allowed when appropriate; include credit fields when the source requires them.

For project images, prefer files under `public/projects/<slug>/` and reference
them with a public path such as:

```yaml
coverImage: "projects/example/og-image.png"
coverImageAlt: "Short description of the image"
```

Do not use `public/blog/` for blog images. Blog images should be remote URLs.

## Pull Requests

Keep pull requests focused, update tests or content checks when behavior
changes, and avoid unrelated formatting churn. The GitHub workflows currently
run linting, script regression tests, Astro checks/builds, content checks, the
AI discovery file check, Unicode checks, and Playwright E2E tests.
