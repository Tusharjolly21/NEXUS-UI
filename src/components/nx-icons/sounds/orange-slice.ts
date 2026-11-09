import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A fizzy hiss under eight juicy rising squirts, one for each segment as it lights up in turn around the slice. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.9), 4800, 8000, 0.015); // 0.04 to 0.94 a fizz runs round the slice
  blip(c, o, 900, t(0.19), 0.05, 0.07, 1250); // 0.19 segment 1 lights
  blip(c, o, 990, t(0.27), 0.05, 0.07, 1350); // 0.27 segment 2 lights
  blip(c, o, 1090, t(0.35), 0.05, 0.07, 1460); // 0.35 segment 3 lights
  blip(c, o, 1200, t(0.43), 0.05, 0.07, 1580); // 0.43 segment 4 lights
  blip(c, o, 1320, t(0.51), 0.05, 0.07, 1710); // 0.51 segment 5 lights
  blip(c, o, 1450, t(0.59), 0.05, 0.07, 1850); // 0.59 segment 6 lights
  blip(c, o, 1590, t(0.67), 0.05, 0.07, 2000); // 0.67 segment 7 lights
  blip(c, o, 1750, t(0.75), 0.05, 0.07, 2160); // 0.75 segment 8 lights
}
