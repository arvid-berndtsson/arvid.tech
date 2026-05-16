#!/usr/bin/env node
// @ts-nocheck

/**
 * Local Cloudflare Pages Testing Script
 *
 * This script orchestrates:
 * 1. Building the Astro project for Cloudflare Pages
 * 2. Starting wrangler pages dev (local Pages runtime on localhost:8788)
 *
 * Usage:
 *   node scripts/test-cloudflare-local.ts
 *   pnpm test:local
 *   mise run test-local
 */

import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${"─".repeat(60)}`, colors.cyan);
  log(`${colors.bright}${title}${colors.reset}`, colors.cyan);
  log(`${"─".repeat(60)}`, colors.cyan);
}

function checkPrerequisites() {
  logSection("Checking Prerequisites");

  // Check if wrangler is available
  try {
    execSync("pnpm exec wrangler --version", {
      cwd: projectRoot,
      stdio: "ignore",
    });
    log("✓ wrangler is available", colors.green);
  } catch {
    log("✗ wrangler is not available", colors.red);
    log("  Run: pnpm install", colors.yellow);
    process.exit(1);
  }

  // Check if build output exists
  const distDir = join(projectRoot, "dist");
  if (!existsSync(distDir)) {
    log("⚠ dist directory not found", colors.yellow);
    log("  Building project first...", colors.yellow);
    return false;
  }

  log("✓ Build output exists", colors.green);
  return true;
}

function buildProject() {
  logSection("Building Project");

  try {
    log("Running astro build...", colors.blue);
    execSync("pnpm exec astro build", {
      cwd: projectRoot,
      stdio: "inherit",
    });

    log("✓ Build completed", colors.green);
    return true;
  } catch {
    log("✗ Build failed", colors.red);
    return false;
  }
}

function waitForServer(url, maxAttempts = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = async () => {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(url, {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok || response.status < 500) {
          resolve(true);
          return;
        }
      } catch {
        // Server not ready yet - continue trying
        if (attempts % 5 === 0) {
          process.stdout.write(".");
        }
      }

      if (attempts >= maxAttempts) {
        reject(
          new Error(
            `Server did not become ready after ${maxAttempts} attempts (${(maxAttempts * interval) / 1000}s)`,
          ),
        );
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

function startWranglerDev() {
  logSection("Starting Wrangler Pages Dev");

  const wranglerProcess = spawn(
    "pnpm",
    ["exec", "wrangler", "pages", "dev", "dist"],
    {
      cwd: projectRoot,
      stdio: "pipe",
      shell: true,
    },
  );

  let wranglerReady = false;
  let localUrl = "http://localhost:8788";
  let hasExited = false;

  wranglerProcess.stdout.on("data", (data) => {
    const output = data.toString();
    process.stdout.write(output);

    // Check for "Ready" message or URL
    if (
      output.includes("Ready") ||
      output.includes("http://") ||
      output.includes("Listening")
    ) {
      const urlMatch = output.match(/https?:\/\/[^\s:]+(?::\d+)?/);
      if (urlMatch) {
        localUrl = urlMatch[0];
      }
      if (
        !wranglerReady &&
        (output.includes("Ready") ||
          output.includes("Listening") ||
          output.includes("http://localhost"))
      ) {
        wranglerReady = true;
      }
    }
  });

  wranglerProcess.stderr.on("data", (data) => {
    const output = data.toString();
    // Wrangler outputs some info to stderr, filter out noise
    if (
      !output.includes("wrangler") ||
      output.includes("Ready") ||
      output.includes("Error") ||
      output.includes("Warning")
    ) {
      process.stderr.write(output);
    }
  });

  wranglerProcess.on("error", (error) => {
    log(`\n✗ Failed to start wrangler: ${error.message}`, colors.red);
    if (error.code === "ENOENT") {
      log(
        "  Make sure pnpm and wrangler are installed: pnpm install",
        colors.yellow,
      );
    }
    cleanup();
    process.exit(1);
  });

  wranglerProcess.on("exit", (code, signal) => {
    if (!hasExited) {
      hasExited = true;
      if (code !== 0 && code !== null) {
        log(`\n✗ Wrangler process exited with code ${code}`, colors.red);
        if (signal) {
          log(`  Signal: ${signal}`, colors.red);
        }
        process.exit(code || 1);
      }
    }
  });

  return { process: wranglerProcess, localUrl, ready: () => wranglerReady };
}

function cleanup() {
  log("\nCleaning up...", colors.yellow);
  // Processes will be killed when parent exits via signal handlers
}

// Main execution
async function main() {
  log(
    `${colors.bright}${colors.cyan}Cloudflare Pages Local Testing${colors.reset}`,
  );
  log(
    `${colors.cyan}===========================================${colors.reset}\n`,
  );

  // Check prerequisites
  const hasBuild = checkPrerequisites();

  // Build if needed
  if (!hasBuild) {
    if (!buildProject()) {
      process.exit(1);
    }
  }

  // Start wrangler pages dev
  const wrangler = startWranglerDev();

  // Wait a bit for wrangler to start
  log("\nWaiting for Wrangler to be ready...", colors.blue);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Try to wait for server to be ready with better feedback
  log("Checking server health", colors.blue);
  try {
    await waitForServer(wrangler.localUrl, 15, 2000);
    log(
      `\n${colors.bright}${colors.green}✓ Wrangler pages dev is ready!${colors.reset}`,
      colors.green,
    );
    log(
      `${colors.bright}Local URL: ${wrangler.localUrl}${colors.reset}`,
      colors.green,
    );
  } catch (error) {
    log(
      `\n${colors.yellow}⚠ Could not verify server readiness: ${error.message}${colors.reset}`,
      colors.yellow,
    );
    log(
      `${colors.yellow}  The server may still be starting. Check the output above for errors.${colors.reset}`,
      colors.yellow,
    );
    log(
      `${colors.yellow}  You can try accessing ${wrangler.localUrl} manually.${colors.reset}`,
      colors.yellow,
    );
  }

  // Display summary
  logSection("Testing Environment Ready");
  log(
    `${colors.bright}Local URL:${colors.reset} ${wrangler.localUrl}`,
    colors.cyan,
  );
  log(`\n${colors.yellow}Press Ctrl+C to stop${colors.reset}`, colors.yellow);

  // Handle cleanup on exit
  const shutdown = (signal) => {
    log(
      `\n\n${colors.yellow}Received ${signal}, shutting down...${colors.reset}`,
      colors.yellow,
    );
    cleanup();
    if (wrangler.process && !wrangler.process.killed) {
      wrangler.process.kill("SIGTERM");
      // Force kill after 2 seconds if still running
      setTimeout(() => {
        if (!wrangler.process.killed) {
          wrangler.process.kill("SIGKILL");
        }
        process.exit(0);
      }, 2000);
    } else {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    log(`\n✗ Uncaught error: ${error.message}`, colors.red);
    cleanup();
    if (wrangler.process) wrangler.process.kill();
    process.exit(1);
  });
}

main().catch((error) => {
  log(`\n✗ Error: ${error.message}`, colors.red);
  process.exit(1);
});
