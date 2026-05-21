import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";

export const GET: APIRoute = async () => {
  const markdownContent = `# About ${siteConfig.name}

${siteConfig.description}

## Location

${siteConfig.location}

## Focus Areas

- Information Security Leadership
- ISO 27001 and SOC 2
- TISAX readiness
- Risk management and vendor assessments
- Incident readiness and backup testing
- Secure development workflows
- Customer trust and security questionnaires
- AI governance
- Full-stack web development

## Contact

- Email: ${siteConfig.email}
- GitHub: ${siteConfig.social.github}
- LinkedIn: ${siteConfig.social.linkedin}
`;

  return new Response(markdownContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
