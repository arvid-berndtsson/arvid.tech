#!/usr/bin/env node
// @ts-nocheck

/**
 * Helper script to get Cloudflare KV Namespace ID by title
 * Requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables
 */

const title = process.argv[2] || "arvid-tech-production-cache";

if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error("Error: CLOUDFLARE_API_TOKEN environment variable is not set");
  process.exit(1);
}

if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  console.error("Error: CLOUDFLARE_ACCOUNT_ID environment variable is not set");
  process.exit(1);
}

try {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  if (data.success && data.result) {
    const namespace = data.result.find((ns) => ns.title === title);
    if (namespace) {
      console.log(namespace.id);
    } else {
      console.error(`KV namespace with title "${title}" not found`);
      console.error("Available namespaces:");
      data.result.forEach((ns) => {
        console.error(`  - ${ns.title} (${ns.id})`);
      });
      process.exit(1);
    }
  } else {
    console.error("API error:", data.errors || "Unknown error");
    process.exit(1);
  }
} catch (error) {
  console.error("Error fetching KV namespace ID:", error.message);
  process.exit(1);
}
