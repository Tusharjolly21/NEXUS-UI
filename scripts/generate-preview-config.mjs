/**
 * generate-preview-config.mjs
 * 
 * Scans public/templates/ for captured screenshots and prints the
 * previewImages config to paste into src/lib/catalog/templates.ts
 * 
 * Usage:
 *   node scripts/generate-preview-config.mjs
 */

import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");

if (!fs.existsSync(TEMPLATES_DIR)) {
  console.log("No public/templates/ directory found. Run capture-template-screenshots.mjs first.");
  process.exit(0);
}

const slugs = fs.readdirSync(TEMPLATES_DIR).filter((f) => {
  return fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory();
});

console.log(`Found ${slugs.length} template directories.\n`);
console.log("Add this to each template in src/lib/catalog/templates.ts:\n");

for (const slug of slugs) {
  const dir = path.join(TEMPLATES_DIR, slug);
  const heroPath = path.join(dir, "hero.webp");
  const hasHero = fs.existsSync(heroPath);

  const sections = [];
  for (let i = 1; i <= 4; i++) {
    const sectionPath = path.join(dir, `section-${i}.webp`);
    if (fs.existsSync(sectionPath)) {
      sections.push(`"/templates/${slug}/section-${i}.webp"`);
    }
  }

  if (hasHero || sections.length > 0) {
    console.log(`// ${slug}`);
    console.log(`previewImages: {`);
    if (hasHero) {
      console.log(`  hero: "/templates/${slug}/hero.webp",`);
    }
    if (sections.length > 0) {
      console.log(`  sections: [${sections.join(", ")}],`);
    }
    console.log(`},\n`);
  }
}
