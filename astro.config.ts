import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: "https://arvid.tech",
  output: "static",
  // Astro defaults: GFM + SmartyPants (gfm: true, smartypants: true).
  // Shiki is default for code blocks; dual theme for light/dark.
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  integrations: [mdx(), react(), sitemap(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react-dom/client"],
    },
    css: {
      postcss: "./postcss.config.mjs",
    },
  },
  redirects: {
    "/sitemap.xml": "/sitemap-index.xml",
    "/sitemap-pages.xml": "/sitemap-index.xml",
    "/sitemap-posts.xml": "/sitemap-index.xml",
    "/sitemap-authors.xml": "/sitemap-index.xml",
    "/sitemap-tags.xml": "/sitemap-index.xml",
    "/works": "/projects",
    "/timeline": "/experiences",
    "/privacy-policy": "/privacy",
    "/books": "/tags/books",
    "/serie": "/tags",
    "/author/arvid": "/about",
    "/about-this-site": "/about",
    "/my-works-are-featured-on": "/projects",
    "/now": "/about",
    "/e-blekinge-institute-of-technology":
      "/education/blekinge-institute-computer-security",
    "/e-malmo-university-bachelor":
      "/education/computer-science-malmo-university",
    "/e-merely-emissions": "/experiences/cofounder-merely-emissions",
    "/e-freelance-2020": "/experiences",
    "/e-strato-uf": "/experiences/cofounder-strato-uf",
    "/e-vertiseit-2021": "/experiences/software-developer-vertiseit",
    "/e-vertiseit-2021-summer":
      "/experiences/junior-software-developer-vertiseit",
    "/voyado": "/experiences/software-developer-intern-voyado",
    "/vertiseit-ab-publ": "/experiences",
    "/malmo-universitet-2": "/education/computer-science-malmo-university",
    "/e-vertiseit-2023": "/experiences/head-of-information-security-vertiseit",
    "/doorlook": "/projects/doorlook",
    "/merelyemissions": "/experiences/cofounder-merely-emissions",
    "/websus-lol": "/projects/websus-lol",
    "/limetip": "/projects/limetip-vat-validation-api",
    "/chess-mcp": "/projects/chess-mcp",
    "/scootseal": "/projects/scootseal",
    "/robots-txt-analyser": "/projects/robots-txt-analyzer",
    "/terminal-project": "/projects/terminal-portfolio",
    "/projects/experiments": "/projects/other",
  },
});
