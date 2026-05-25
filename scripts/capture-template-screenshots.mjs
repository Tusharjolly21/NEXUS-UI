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

// All template slugs from the catalog
const TEMPLATE_SLUGS = [
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
// These capture different parts of the landing page
const SECTION_POSITIONS = [0, 0.25, 0.5, 0.75];

async function captureTemplate(browser, slug) {
  const dir = path.join(OUTPUT_DIR, slug);
  await fs.mkdir(dir, { recursive: true });

  const url = `${BASE_URL}/live-preview/template/${slug}`;
  console.log(`📸 Capturing: ${slug} → ${url}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    // Wait for animations to settle
    await new Promise((r) => setTimeout(r, 2000));

    // Hero screenshot (top of page, used for listing)
    await page.screenshot({
      path: path.join(dir, "hero.webp"),
      type: "webp",
      quality: 85,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log(`  ✓ hero.webp`);

    // Get total page height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);

    // Section screenshots
    for (let i = 0; i < SECTION_POSITIONS.length; i++) {
      const scrollY = Math.floor(pageHeight * SECTION_POSITIONS[i]);
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await new Promise((r) => setTimeout(r, 800)); // Wait for scroll animations

      await page.screenshot({
        path: path.join(dir, `section-${i + 1}.webp`),
        type: "webp",
        quality: 85,
        clip: { x: 0, y: 0, width: 1440, height: 900 },
      });
      console.log(`  ✓ section-${i + 1}.webp`);
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
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const slug of TEMPLATE_SLUGS) {
    await captureTemplate(browser, slug);
  }

  await browser.close();

  console.log(`\n✅ Done! Screenshots saved to public/templates/`);
  console.log(`\nNext step: Add previewImages to each template in src/lib/catalog/templates.ts`);
  console.log(`Or run: node scripts/generate-preview-config.mjs`);
}

main().catch(console.error);
