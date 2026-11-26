# Cinematic homepage — design

## Intent
A first-time visitor lands on nexus-ui.com and thinks "wow". The benchmark for feel was ui.aceternity.com (premium,
product-first, crisp blueprint lines); the design is original. Navbar and footer are unchanged.

## Goals / non-goals / anti-goals
- Goals: a strong first impression; real Nexus components running on the page; works in light and dark; same SEO
  (H1, WebSite / FAQPage / Organization JSON-LD).
- Non-goals: changing the nav, the footer or other pages (apart from the block count fix below).
- Anti-goals: copying Aceternity's layouts or effects; gimmicks that aren't the product; motion for people who ask for
  reduced motion.

## Approaches considered
1. **Bespoke sections with real components inside (picked).** One coherent look, the product itself on display.
2. Stacking existing showcase components as full sections: fastest, but stitched-together and heavy.
3. A full WebGL hero: most dramatic, worst for load, phones and SEO.

Hero visuals tried and dropped during review: a 3D ring of screenshots, a dotted globe, an exploded card stack, and a
browser-chrome showcase window.

## Sections (top to bottom)
1. **Hero** — blueprint grid with light pulses, aurora, headline with the rotating word, CTAs, a rotating real comment
   with drawn avatars (Notionists, CC0). On wide screens, "code becomes UI": an editor types a real snippet and the
   component it describes renders underneath (Gooey Input, Slide to Confirm, Like Burst).
2. **Live wall** — 16 home-pick components running in a dashed masonry grid; columns drift with scroll; links to /mcp.
3. **Numbers** — odometer panel: components, blocks (128), templates, icons, videos.
4. **Template rows** — two rows of template screenshots moving opposite ways on scroll.
5. **Gallery → repo** — pinned scroll story; Lens Search, Bolting Sliders and Terminal play the three steps live.
6. **Shelves** — bento of components, templates, blocks, videos, sounds, icons.
7. **What people say**, **Shipping log** — existing components.
8. **Pricing** — Pro forward with an edge light; plan links, member states and India discounts unchanged.
9. **FAQ** — native `<details>` cards (answers stay in the HTML), contact note.
10. **Finale** — lit horizon rising under the last call to action.

## Block count
`CATALOG_COUNTS.blocks` now counts individual blocks (the 128 the Blocks page lists); `blockCategories` (23) and
`freeBlocks` sit beside it. Dashboard, docs introduction, OG image, pricing teaser and video defaults follow.

## Builder's notes
- Code lives in `src/components/home-cinematic/`, styles scoped under `.cx` in `cinematic.css`.
- framer-motion only; no new dependencies. Live previews go through `FitPreview` (mounts near the viewport).
- Every effect respects `prefers-reduced-motion`.
