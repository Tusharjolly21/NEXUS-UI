/**
 * capture-template-screenshots.mjs
 * 
 * Captures screenshots of all template live previews from your website.
 * 
 * Prerequisites:
 *   npm install -D puppeteer
 * 
 * Usage:
 *   node scripts/capture-template-screenshots.mjs
 *   SITE_URL=http://localhost:3000 SLUGS=orbit-ai-page,ai-startup-forge node scripts/capture-template-screenshots.mjs
 *
 * Env:
 *   SITE_URL                   where the live previews are served (default: production)
 *   SLUGS                      comma-separated subset of templates to capture
 *   PUPPETEER_EXECUTABLE_PATH  use an installed Chromium instead of Puppeteer's download
 *   SECTION_SUFFIX             file suffix for section shots (default "-v2", matching the catalog)
 * 
 * This will:
 *   1. Visit each template's live preview page
 *   2. Take a full-page screenshot for the hero (listing page preview)
 *   3. Scroll to 4 different viewport positions and capture section screenshots
 *   4. Save all images to public/templates/{slug}/
 * 
 * After running, the images will be automatically picked up by the template catalog.
 */

import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const BASE_URL = process.env.SITE_URL || "https://www.nexus-ui.com";
const OUTPUT_DIR = path.join(process.cwd(), "public", "templates");
const SECTION_SUFFIX = process.env.SECTION_SUFFIX ?? "-v2";
const ONLY = (process.env.SLUGS || "").split(",").map((s) => s.trim()).filter(Boolean);

// All template slugs from the catalog
const TEMPLATE_SLUGS = [
  "kiosk",
  "wharf",
  "plotline",
  "last-light",
  "nimbus",
  "margin",
  "skein",
  "relay",
  "tally",
  "wayfare",
  "side-b",
  "kiln",
  "cairn",
  "strata",
  "afterglow",
  "ferry",
  "launchfolio-portfolio",
  "noir-studio",
  "nexus-ai-launch",
  "saas-launch-aurora",
  "ai-startup-forge",
  "simplistic-saas-template",
  "orbit-ai-page",
  "talent-hub-landing",
  "synapse-ai-platform",
  "helix-ai-platform",
  "orion-ai-ops",
  "startup-landing-page",
  "nova-landing-page",
  "claura-agency",
  "pulse-landing",
  "aether-portfolio",
  "ocean-flow",
  "macbook-pro-showcase",
];

// Section scroll positions (percentage of page height)
// These capture different parts of the landing page (the hero already has its own shot)
const SECTION_POSITIONS = [0.16, 0.36, 0.56, 0.76];

async function captureTemplate(browser, slug) {
  const dir = path.join(OUTPUT_DIR, slug);
  await fs.mkdir(dir, { recursive: true });

  const url = `${BASE_URL}/live-preview/template/${slug}`;
  console.log(`📸 Capturing: ${slug} → ${url}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
    // Hide the Next.js dev-tools badge when capturing from a dev server
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    // Wait for entrance animations and hero demos to settle
    await new Promise((r) => setTimeout(r, 3500));

    // Hero screenshot (top of page, used for listing)
    await page.screenshot({
      path: path.join(dir, "hero.webp"),
      type: "webp",
      quality: 85,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log(`  ✓ hero.webp`);

    // Get total page height
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    // Section screenshots. Walk down a viewport at a time so in-view animations fire the way they do
    // for a visitor, instead of jumping straight to each position and catching them mid-reveal.
    let y = 0;
    for (let i = 0; i < SECTION_POSITIONS.length; i++) {
      const target = Math.min(Math.floor(pageHeight * SECTION_POSITIONS[i]), pageHeight - 900);
      while (y < target) {
        y = Math.min(target, y + 700);
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await new Promise((r) => setTimeout(r, 350));
      }
      await page.evaluate((top) => window.scrollTo(0, top), target);
      await new Promise((r) => setTimeout(r, 2200));

      await page.screenshot({
        path: path.join(dir, `section-${i + 1}${SECTION_SUFFIX}.webp`),
        type: "webp",
        quality: 85,
      });
      console.log(`  ✓ section-${i + 1}${SECTION_SUFFIX}.webp`);
    }
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log(`\n🚀 Capturing template screenshots from ${BASE_URL}\n`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    protocolTimeout: 240000,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const slugs = ONLY.length ? TEMPLATE_SLUGS.filter((s) => ONLY.includes(s)) : TEMPLATE_SLUGS;
  for (const slug of slugs) {
    await captureTemplate(browser, slug);
  }

  await browser.close();

  console.log(`\n✅ Done! Screenshots saved to public/templates/`);
  console.log(`\nNext step: Add previewImages to each template in src/lib/catalog/templates.ts`);
  console.log(`Or run: node scripts/generate-preview-config.mjs`);
}

main().catch(console.error);
