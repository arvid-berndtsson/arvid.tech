import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";

export const GET: APIRoute = async () => {
  const markdownContent = `# ${siteConfig.name}

${siteConfig.title}

${siteConfig.description}

## Navigation

- [About](/about.md)
- [Blog](/blog.md)
- [Projects](/projects)
- [Experiences](/experiences)
- [Search](/search)

## Links

- GitHub: ${siteConfig.social.github}
- LinkedIn: ${siteConfig.social.linkedin}
- Email: ${siteConfig.email}

---

This is the markdown view of ${siteConfig.url}.
`;

  return new Response(markdownContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
