import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.11;

/** A low water rush as the shark glides forward, a sub swell under it, sharp swishes as the tail sweeps each way with the big one in the middle, and the rush ebbing as it slides back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.4), 180, 750, 0.11); // 0.00-0.40 the glide forward, a rush of water
  blip(c, o, 62, t(0.0), 0.12, 0.5, 84); // 0.00-0.50 deep sub swell under the glide
  swish(c, o, t(0.0), t(0.2), 1200, 3800, 0.07); // 0.00-0.20 the tail swings out, fastest at 0.1
  swish(c, o, t(0.2), t(0.2), 3800, 1000, 0.12); // 0.20-0.40 the big sweep the other way, fastest at 0.3
  swish(c, o, t(0.4), t(0.2), 1100, 3400, 0.09); // 0.40-0.60 the tail swings back, fastest at 0.5
  swish(c, o, t(0.6), t(0.2), 3200, 1100, 0.07); // 0.60-0.80 a smaller sweep, fastest at 0.7
  swish(c, o, t(0.8), t(0.2), 1500, 2600, 0.04); // 0.80-1.00 the tail settles, fastest at 0.9
  swish(c, o, t(0.6), t(0.4), 700, 190, 0.06); // 0.60-1.00 the glide returns, the rush ebbs
  blip(c, o, 78, t(0.6), 0.05, 0.4, 58); // 0.60-1.00 the sub swell sinks away
}
