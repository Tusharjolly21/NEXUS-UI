import { getLandDots } from "./data/map";

let dotsPath: string | null = null;

/** One SVG path with a zero-length, round-capped stroke at every land cell: thousands of dots as a single element. */
function landDotsPath() {
  dotsPath ??= getLandDots()
    .map(([x, y]) => `M${x} ${y}h0`)
    .join("");
  return dotsPath;
}

/** The dotted land of the radar map. `radius` is the dot radius in map cells; `color` is any CSS colour. */
export function LandDots({ radius, color }: { radius: number; color: string }) {
  return <path d={landDotsPath()} fill="none" stroke={color} strokeWidth={radius * 2} strokeLinecap="round" />;
}
