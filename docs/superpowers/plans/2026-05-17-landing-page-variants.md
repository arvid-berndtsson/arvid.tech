# Landing Page Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three standalone landing page variants that remove rule-heavy styling, pills, bullet lists, and confusing top text.

**Architecture:** Create one reusable Astro component for landing variants and three thin route files that pass variant data. Add Playwright coverage for route existence and the content/style constraints the user requested.

**Tech Stack:** Astro 6, Tailwind CSS utility classes, Playwright.

---

### Task 1: Add Failing Route And Constraint Tests

**Files:**
- Create: `tests/landing-variants.spec.ts`

- [ ] Add Playwright tests that visit `/landing/v1`, `/landing/v2`, and `/landing/v3`.
- [ ] Assert each page has one visible `h1`.
- [ ] Assert the main content does not include `MoMA`, `Warburg`, or `Jump to`.
- [ ] Assert the main content does not contain unordered or ordered lists.
- [ ] Assert no element inside `main` uses `rounded-full`, which is the current pill treatment.
- [ ] Assert there is no horizontal overflow on mobile.
- [ ] Run `pnpm exec playwright test tests/landing-variants.spec.ts --project=chromium` and confirm the tests fail because the routes do not exist yet.

### Task 2: Implement Shared Landing Variant Component

**Files:**
- Create: `src/components/LandingVariantPage.astro`

- [ ] Build a component that accepts a `variant` prop: `editorial`, `console`, or `studio`.
- [ ] Fetch featured projects, recent blog posts, and recent recommendations inside the component.
- [ ] Render sections using prose, simple cards, and text links instead of lists, pills, or divider rules.
- [ ] Avoid the current location eyebrow and any MoMA/Warburg text.
- [ ] Keep button corners modest and avoid `rounded-full`.

### Task 3: Add Three Routes

**Files:**
- Create: `src/pages/landing/v1.astro`
- Create: `src/pages/landing/v2.astro`
- Create: `src/pages/landing/v3.astro`

- [ ] Each route imports `BaseLayout` and `LandingVariantPage`.
- [ ] Each route passes a different variant value and title metadata.
- [ ] Run the landing variant Playwright test and confirm it passes.

### Task 4: Visual And Full Verification

**Files:**
- No required source edits.

- [ ] Start the local dev server.
- [ ] Inspect all three pages in the browser at desktop and mobile widths.
- [ ] Run `pnpm exec astro check`.
- [ ] Run `pnpm run test`.
- [ ] Report the exact verification results.
