Make a 12-second developer demo video that renders in 1:1 (X, LinkedIn), 16:9 (YouTube) and 9:16 (Shorts) from one React component, re-laying out its panels for each shape. Apple-clean: light #f5f5f7 background, Inter Display for captions, SF Mono / ui-monospace for code. Music 120 BPM, soft keyboard ticks while typing, a tick per CLI check, a whoosh when the component slides.

Three panels — a dark terminal, a light code editor (Xcode light colours: pink keywords, red strings, blue JSX) and a light browser preview — animate between layout keyframes (position and size eased together, never cut). In 16:9 they sit side by side; in 1:1 and 9:16 they stack.

0–1s: "Add motion in one line." in big type, then it shrinks away as the terminal rises.
1–4.4s, caption "One command.": the terminal types "npx shadcn@latest add @nexus-labs/slide-to-confirm" at a human pace with a block caret, Enter, then three CLI lines each with a spinner that turns into a green check: Checking registry, Installing dependencies, Created 1 file, and the file path highlighted in blue.
4.4–5s: the file path lifts out of the terminal as a chip and flies to where the editor opens; the terminal shrinks aside.
5–7.4s, caption "Use it like any component.": the editor shows page.tsx; the import line types in, then the JSX line inside main types in, with a caret and line numbers.
7.4–8s: the editor moves aside and the preview opens.
8–10.4s, caption "It just moves.": a cursor grabs the slider's knob, drags it along the track (the track fills blue as it goes), lets go at the end; it turns green with a check and "Payment confirmed" fades up.
10.4–12s: panels shrink and blur away; end card "nexus-ui.com" in the brand gradient and "183 components. One command each."

Pure function of time t with frame width/height props; registry item, file path, component name and labels are props.
