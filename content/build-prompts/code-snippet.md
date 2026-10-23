# Code Snippet

Build a polished code block for developer landing pages and docs: a macOS-style header, the language in quiet monospace that you can click to switch, a small Copy button that morphs into a tick, real token-level highlighting for five languages with no highlighter library, two themes, optional line numbers, and lines that roll in one after another when the language changes.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS and framer-motion (`motion`, `AnimatePresence`). `cn` for class merging.
- File: `components/code-snippet/code-snippet.tsx` plus an `index.ts`. Named exports: `CodeSnippet`, `CodeSnippetProps`, `CodeSnippetLang` and `CodeSnippetTheme`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `initial` | `"js" \| "ts" \| "python" \| "bash" \| "json"` | `"js"` | Language shown first. |
| `theme` | `"dark" \| "light"` | `"dark"` | Colour theme. |
| `lineNumbers` | `boolean` | `true` | Shows line numbers. |
| `controls` | `boolean` | `true` | Shows the chip row under the block. |
| `autoplay` | `boolean` | `false` | Tours the languages every ~3.6s until touched. Pauses off screen. |
| `className` | `string` | none | Extra classes for the wrapper. |

## Layout and look

- A column, `max-w-[520px]`, gap 12px. The block has radius 12px, a 1px border and a deep soft shadow. Dark: background `#0f1117`, text `#e6edf3`, border `rgba(240,246,252,.1)`. Light: background `#fff`, header `#f6f8fa`, text `#1f2328`. Animate the background and border colour when the theme changes.
- Header: three 11px traffic-light dots (`#ff5f57`, `#febc2e`, `#28c840`), a spacer, the language id in 12px monospace (button; the id rolls up and out with a spring when it changes), and a 22px outlined Copy button whose label swaps to a green animated tick and "Copied" for 1.6s.
- Body: a monospace block, 13px, line-height 1.55, padding 16px, horizontally scrollable. Line numbers are a 48px right-aligned column at 70% opacity, `aria-hidden`.
- Token colours (dark): keyword `#ff7b72`, string `#a5d6ff`, number `#79c0ff`, comment `#8b949e`, function `#d2a8ff`, JSON key `#7ee787`, punctuation `#c9d1d9`. Light has its own set. Render `=>` as a ligature-style arrow.
- Below the block, if `controls`: chips for each language (`aria-pressed`), a divider, "Light theme" or "Dark theme" and "Line numbers on/off". Chips are 36px tall pills.

## Highlighting

- Keep one snippet per language (a small fetch-a-user example in each) as constants. Write a single-pass tokenizer that handles, in order: comments (`//` or `#`, but keep a bash shebang), strings (double, single and template, plus Python f-strings; in JSON a string followed by `:` is a key), `$VARS`, numbers, identifiers (keyword set per language, or a function when followed by `(`), `=>`, whitespace, and any other character as punctuation. Tokenise per line and memoise per language.

## Motion

- On language change each line enters with opacity 0 to 1, x -8 to 0 and blur 4px to 0, staggered 25ms per line, with a spring (stiffness 420, damping 34).
- Copy uses `navigator.clipboard.writeText`; if it is blocked, still show the tick so the button never feels dead.

## Accessibility

- The code region carries an `aria-label` with the file name. The language button's label reads "Language: JS. Switch language". The Copy button's label is "Copy fetch-user.js" and becomes "Copied".
