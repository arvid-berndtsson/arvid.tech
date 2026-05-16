# Landing Page Variants Design

## Goal

Create three separate landing page variants so the current homepage can remain untouched while alternative directions are compared.

## Approved Scope

- Add three new pages: `/landing/v1`, `/landing/v2`, and `/landing/v3`.
- Remove the current rule-heavy feel from the new pages. Use open spacing, soft blocks, and composition instead of divider lines and bordered strips.
- Remove bullet lists and pill treatments from the new pages. Content should read as prose, compact cards, or simple text links.
- Do not include the confusing MoMA/Warburg-style top text. The variants should lead with Arvid's name, role, and value proposition.
- Keep the existing homepage at `/` unchanged.

## Variant Directions

1. **Editorial Focus**: a quiet, text-led page with a broad introduction and selected work presented like an index.
2. **Security Console**: a more operational page that emphasizes security leadership, systems thinking, and project evidence without becoming a dashboard.
3. **Studio Profile**: a warmer personal page that balances engineering, writing, recommendations, and contact.

## Technical Notes

- Use Astro routes and existing content collections.
- Prefer a shared component so the three pages stay consistent while still allowing distinct layouts.
- Preserve accessibility basics: one `h1`, named sections, readable contrast, and no horizontal overflow on mobile.
- Use visual verification after implementation to check the three variants at desktop and mobile sizes.
