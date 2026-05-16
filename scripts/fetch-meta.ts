#!/usr/bin/env node
// @ts-nocheck

const argUrl =
  args.find((a) => /^https?:\/\//i.test(a)) ||
  (args.find((a) => /^URL=/i.test(a)) || "").split("=")[1];
const url = process.env.URL || argUrl || "http://localhost:3000/";

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

let res;
try {
  res = await fetch(url);
} catch (e) {
  console.error(`${red("✖")} Failed to fetch ${url}`);
  console.error(dim(String(e?.message || e)));
  process.exit(1);
}

const statusLine = `${res.status} ${res.statusText}`;
const contentType = res.headers.get("content-type") || "";
const html = await res.text();

const esc = (s) => (s ? String(s).replace(/\s+/g, " ").trim() : "");
const pick = (re) => {
  const m = html.match(re);
  return (m && m[1]) || "";
};
const dash = (v) => (v ? v : "—");

const meta = {
  url,
  title: esc(pick(/<title[^>]*>([^<]*)<\/title>/i)),
  description: esc(
    pick(
      /<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
    ),
  ),
  canonical: esc(
    pick(
      /<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\'][^>]*>/i,
    ),
  ),
  og: {
    title: esc(
      pick(
        /<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
    description: esc(
      pick(
        /<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
    url: esc(
      pick(
        /<meta[^>]*property=["\']og:url["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
    image: esc(
      pick(
        /<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
  },
  twitter: {
    card: esc(
      pick(
        /<meta[^>]*name=["\']twitter:card["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
    title: esc(
      pick(
        /<meta[^>]*name=["\']twitter:title["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
    description: esc(
      pick(
        /<meta[^>]*name=["\']twitter:description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
    image: esc(
      pick(
        /<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i,
      ),
    ),
  },
};

const ok = res.ok ? green("✓") : red("✖");
console.log(
  `\n${ok} ${bold("Fetched metadata")} ${dim(`(${statusLine} • ${contentType || "unknown"})`)}\n`,
);

console.log(`🔎  ${bold("URL")}          ${meta.url}`);
console.log(`🏷️  ${bold("Title")}        ${dash(meta.title)}`);
console.log(`📝  ${bold("Description")}  ${dash(meta.description)}`);
if (meta.canonical)
  console.log(`🔗  ${bold("Canonical")}    ${meta.canonical}`);

console.log(`\n🗂️  ${bold("Open Graph")}`);
console.log(`   • 🏷️  title        ${dash(meta.og.title)}`);
console.log(`   • 📝  description  ${dash(meta.og.description)}`);
console.log(`   • 🔗  url          ${dash(meta.og.url)}`);
console.log(`   • 🖼️  image        ${dash(meta.og.image)}`);

console.log(`\n🐦  ${bold("Twitter")}`);
console.log(`   • 🧾  card         ${dash(meta.twitter.card)}`);
console.log(`   • 🏷️  title        ${dash(meta.twitter.title)}`);
console.log(`   • 📝  description  ${dash(meta.twitter.description)}`);
console.log(`   • 🖼️  image        ${dash(meta.twitter.image)}`);
console.log("");
