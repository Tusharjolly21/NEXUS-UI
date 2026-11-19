import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.21;

/** A small charm on a chain: a light metal chime at each end of the pendant swing, quieter every time, over a faint swish of the swing. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 900, 1700, 0.02); // 0.00-0.18 the symbol swings out
  ding(c, o, 2210, t(0.18), 0.06, 0.3); // 0.18 the swing turns: chime
  ding(c, o, 2050, t(0.42), 0.045, 0.28); // 0.42 the swing turns back: softer chime
  ding(c, o, 1930, t(0.64), 0.03, 0.25); // 0.64 a smaller swing turns
  ding(c, o, 1870, t(0.84), 0.018, 0.22); // 0.84 the last little turn
  swish(c, o, t(0.42), t(0.58), 1500, 800, 0.012); // 0.42-1.00 the swing dies away
}
