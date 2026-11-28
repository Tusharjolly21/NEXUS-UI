/**
 * Caps the pixel ratio that canvas and WebGL previews read, while a wall of them is on screen.
 *
 * Many previews size their canvas as (CSS size x devicePixelRatio), up to 3x, so on a retina screen one preview draws
 * four to nine times the pixels it needs for a tile that is shown shrunk to a fraction of its size. With a dozen of them
 * running at once that is most of the page's drawing cost. Capping what they read to 1.5 cuts the pixels by almost half
 * (or by three quarters at 3x) and a shrunk tile looks the same. The inspector, which shows one preview at full size,
 * turns the cap off so that one stays sharp.
 *
 * Only previews that start while the cap is on are affected (a canvas keeps the size it was made with), and nothing
 * else reads the value for layout: CSS pixels and `next/image` are untouched.
 */
let depth = 0;
let original: PropertyDescriptor | undefined;

function realRatio() {
  return original?.get ? Number(original.get.call(window)) : Number(original?.value ?? 1);
}

/** Turns the cap on and returns the function that turns it off again. Safe to nest. */
export function capPixelRatio(max = 1.5): () => void {
  if (typeof window === "undefined") return () => {};
  if (depth === 0) {
    original = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
    // Where the property can't be redefined, leave it alone: the page just runs as it did before.
    if (!original || original.configurable === false) return () => {};
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => Math.min(realRatio(), max) });
  }
  depth++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    depth--;
    if (depth === 0 && original) Object.defineProperty(window, "devicePixelRatio", original);
  };
}
