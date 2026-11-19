/**
 * Counts the library components (and how many are Pro) by reading src/lib/catalog/library-components.ts
 * as text, and writes src/lib/catalog/component-counts.generated.json.
 *
 * Why: the site header and footer quote these numbers on every page. Importing the catalog itself for
 * them pulls the whole live-preview registry (about 6 MB of script) into the layout, so every page,
 * even /terms, downloaded it. Reading the numbers from this small file keeps that out of the layout.
 * Runs before every build and dev start; run it by hand after adding or removing a component.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = fs.readFileSync(path.join(root, "src/lib/catalog/library-components.ts"), "utf8");

let components = 0;
let pro = 0;
for (const chunk of catalog.split(/\n  \{\n    slug: "/).slice(1)) {
  const premium = /\n    premium: (true|false)/.exec(chunk)?.[1];
  if (!premium) throw new Error(`No premium flag for catalog entry "${chunk.slice(0, chunk.indexOf('"'))}"`);
  components++;
  if (premium === "true") pro++;
}

const out = path.join(root, "src/lib/catalog/component-counts.generated.json");
const next = JSON.stringify({ components, pro }, null, 2) + "\n";
if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== next) fs.writeFileSync(out, next);
console.log(`catalog counts: ${components} components, ${pro} Pro`);
