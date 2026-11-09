import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low water rush that builds as the shark glides forward with a deep sub swell, sharp swishes as the tail sweeps from side to side, and the rush ebbing as it slides back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.4), 180, 750, 0.11); // 0.00-0.40 the glide forward, a rush of water
  blip(c, o, 62, t(0.0), 0.12, 0.5, 84); // 0.00-0.50 deep sub swell under the glide
  swish(c, o, t(0.1), t(0.14), 1200, 3800, 0.08); // 0.10-0.24 the tail swings out, fastest at 0.2
  swish(c, o, t(0.3), t(0.2), 3800, 1000, 0.12); // 0.30-0.50 the tail sweeps hard the other way, fastest at 0.4
  swish(c, o, t(0.52), t(0.16), 1100, 3200, 0.08); // 0.52-0.68 the tail swings back, fastest at 0.6
  swish(c, o, t(0.72), t(0.12), 2600, 1100, 0.05); // 0.72-0.84 a smaller sweep at 0.8
  swish(c, o, t(0.6), t(0.4), 700, 190, 0.06); // 0.60-1.00 the glide returns, the rush ebbs
  blip(c, o, 78, t(0.6), 0.05, 0.4, 58); // 0.60-1.00 the sub swell sinks away
}
