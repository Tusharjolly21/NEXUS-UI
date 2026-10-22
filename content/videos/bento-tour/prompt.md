Make a 14-second product overview video for YouTube, Product Hunt and my website that renders in 16:9, 1:1 and 9:16 from one React component. Apple-clean light #f5f5f7, white rounded tiles with soft shadows, Inter Display. Music 120 BPM; every camera move starts on a beat.

The product is shown as a bento grid of four tiles, re-arranged for each aspect ratio (16:9: one big tile on the left, two small and one wide on the right; 1:1: wide / two small / wide; 9:16: big / two small / wide):
1. "183 animated components": odometer digits, and a mosaic of real component screenshots in three columns scrolling at different speeds behind a fade.
2. "24 interface sounds": a play button and a waveform of rounded bars that moves continuously and kicks on every beat.
3. "22 complete templates": a fan of three real template thumbnails that shuffles, the front card dropping to the back every 1.2s.
4. A dark terminal tile that types npx shadcn@latest add @nexus-labs/<name>, cycling through real package names, under "One command. It's your code."

0–1s: "Everything in Nexus UI." rises and dissolves.
1–2.6s: tiles spring in one after another (scale, lift and de-blur); numbers roll.
2.6–12.6s: a camera (one transform on the whole grid) flies into each tile in turn until it nearly fills the frame, holds while the tile's content plays, then flies to the next. Moves between tiles pull back slightly mid-flight (an arc in zoom), eased in-out, never cut. Zoom is computed from the tile rectangle so it works in every format.
12.6–14s: the camera returns to the full grid, which dims and blurs behind an end card: "Nexus UI", "nexus-ui.com" in the brand gradient, and a pill "Free to start".

Pure function of time t with frame width/height props; numbers, labels and package names are props.
