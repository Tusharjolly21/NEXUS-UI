import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT  = path.join(__dirname, "../public/templates/launchfolio-portfolio");
const BASE = "http://localhost:3000/live-preview/template/launchfolio-portfolio";
const W = 1440;
const H = 900;

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setScroll(page, y) {
  await page.evaluate((sy) => {
    document.documentElement.scrollTop = sy;
    document.body.scrollTop = sy;
    window.scrollTo(0, sy);
  }, y);
}

async function scrollTo(page, targetY, step = 200, delay = 50) {
  let pos = await page.evaluate(() =>
    Math.max(document.documentElement.scrollTop, window.scrollY)
  );
  const dir = targetY > pos ? 1 : -1;
  while (Math.abs(pos - targetY) > step) {
    pos += dir * step;
    await setScroll(page, pos);
    await wait(delay);
  }
  await setScroll(page, targetY);
  await wait(600);
}

// After load: sweep inline styles and inject CSS backup
async function forceAllVisible(page) {
  const count = await page.evaluate(() => {
    let n = 0;
    document.querySelectorAll("*").forEach((el) => {
      if (!el.style) return;
      // Fix inline opacity:0
      if (el.style.opacity === "0") {
        el.style.setProperty("opacity", "1", "important");
        n++;
      }
      // Fix inline blur filter
      const f = el.style.filter || "";
      if (f && f.includes("blur") && !f.includes("blur(0")) {
        el.style.setProperty("filter", "none", "important");
        n++;
      }
      // Fix translateY offscreen
      const t = el.style.transform || "";
      if (t && (t.includes("translateY(20") || t.includes("translateY(24") ||
                t.includes("translateY(100") || t.includes("translateY(32"))) {
        el.style.setProperty("transform", "none", "important");
        n++;
      }
    });
    return n;
  });
  console.log(`  inline sweep fixed ${count} elements`);

  // CSS backup for GSAP class-named elements
  await page.addStyleTag({ content: `
    .svc-left, .svc-item, .svc-stack-icon,
    .tg-head, .tg-card,
    .blog-head, .blog-featured, .blog-small,
    .price-head, .price-step, .price-card,
    .faq-left, .faq-right,
    .footer-cta, .footer-meta {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
      visibility: visible !important;
    }
  `}).catch(() => {});
}

const SHOTS = [
  { name: "hero",         scrollY: 80,   label: "Hero + Projects" },
  { name: "section-1-v2", scrollY: 4500, label: "Services" },
  { name: "section-2-v2", scrollY: 5260, label: "About" },
  { name: "section-3-v2", scrollY: 6200, label: "Pricing" },
  { name: "section-4-v2", scrollY: 9020, label: "Blog" },
];

(async () => {
  console.log("Launching Puppeteer…");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--force-color-profile=srgb",
      "--font-render-hinting=none",
    ],
  });

  const page = await browser.newPage();

  // ── Intercept GSAP before page scripts load ──────────────────────────────
  // Strip opacity/filter/x/y from all gsap.from() calls so elements are
  // never set to their "hidden" start state.
  await page.evaluateOnNewDocument(() => {
    let _gsapRef;
    Object.defineProperty(window, "gsap", {
      configurable: true,
      enumerable: true,
      get() { return _gsapRef; },
      set(lib) {
        if (lib && typeof lib.from === "function") {
          const _origFrom = lib.from.bind(lib);
          lib.from = (targets, vars, pos) => {
            if (vars && typeof vars === "object") {
              // Remove all visibility-related from-state props
              delete vars.opacity;
              delete vars.filter;
              delete vars.autoAlpha;
              // Keep x/y/scale so the motion still looks natural
            }
            return _origFrom(targets, vars, pos);
          };

          const _origFromTo = lib.fromTo && lib.fromTo.bind(lib);
          if (_origFromTo) {
            lib.fromTo = (targets, fromVars, toVars, pos) => {
              if (fromVars) {
                delete fromVars.opacity;
                delete fromVars.filter;
                delete fromVars.autoAlpha;
              }
              return _origFromTo(targets, fromVars, toVars, pos);
            };
          }

          // Also intercept gsap.set so no element gets opacity:0 via set()
          const _origSet = lib.set.bind(lib);
          lib.set = (targets, vars) => {
            if (vars && typeof vars === "object") {
              delete vars.opacity;
              delete vars.autoAlpha;
            }
            return _origSet(targets, vars);
          };
        }
        _gsapRef = lib;
      },
    });
  });

  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  page.on("console", () => {});

  console.log("Loading page…");
  await page.goto(BASE, { waitUntil: "networkidle0", timeout: 90000 });
  await wait(4000);

  // Check how many are hidden despite the GSAP intercept (Framer Motion etc.)
  const hiddenOnLoad = await page.evaluate(() => {
    let n = 0;
    document.querySelectorAll("*").forEach(el => {
      const c = window.getComputedStyle(el);
      if (c.opacity === "0") n++;
    });
    return n;
  });
  console.log(`Hidden elements after load: ${hiddenOnLoad}`);

  // Force Framer Motion and any remaining hidden elements visible
  await forceAllVisible(page);
  await wait(500);

  // Warm-up scroll (still useful for ScrollTrigger context)
  console.log("Warm-up scroll…");
  await scrollTo(page, 12000, 250, 40);
  await wait(1500);

  // Final sweep
  await forceAllVisible(page);
  await wait(400);

  // ── Take each shot ──────────────────────────────────────────────────────
  for (const { name, scrollY, label } of SHOTS) {
    console.log(`  Shooting ${name} — ${label} (scrollY=${scrollY})…`);
    await setScroll(page, scrollY);
    await wait(700);

    // Quick inline sweep in case Framer Motion re-applied opacity:0
    await page.evaluate(() => {
      document.querySelectorAll("*").forEach(el => {
        if (el.style && el.style.opacity === "0") {
          el.style.setProperty("opacity", "1", "important");
        }
        if (el.style) {
          const f = el.style.filter || "";
          if (f && f.includes("blur") && !f.includes("blur(0")) {
            el.style.setProperty("filter", "none", "important");
          }
        }
      });
    });
    await wait(200);

    const dest = name === "hero" ? `${OUT}/hero.webp` : `${OUT}/${name}.webp`;
    await page.screenshot({
      path: dest,
      type: "webp",
      quality: 90,
      // No clip — capture the current viewport at the scrolled position
    });

    const { size } = await import("fs").then(m => m.promises.stat(dest));
    console.log(`    ✓ ${name}.webp — ${Math.round(size / 1024)}KB`);
  }

  await browser.close();
  console.log("\nDone — public/templates/launchfolio-portfolio/");
})();
