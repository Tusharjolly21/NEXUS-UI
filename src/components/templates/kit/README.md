# Motion Kit template kit

Shared building blocks for every Nexus UI template.

- `parts.tsx`: page pieces every template uses (nav, reveals, staggered lists, word-by-word headings,
  fit-to-width wrapper, counters, marquee, magnetic buttons, section headers, spotlight, FAQ,
  sticky scroll story, CTA band, footer, phone frame) plus the shared `card` style, `ease` curve and
  `scrollToId` helper.
- `components/`: the 66 Motion Kit components, one self-contained file each. They import only
  `react` and `framer-motion`, take zero required props and accept `autoplay`.

Templates import from `@/components/templates/kit/...`. The template download follows those imports,
so each zip contains only the files its template uses.
