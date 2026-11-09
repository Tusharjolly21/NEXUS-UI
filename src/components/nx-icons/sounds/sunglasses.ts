import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.65;

/** A light plastic slide as the shades drop on the nose and a tick as they land, a bright glassy ting for the glint on each lens with a quick high shimmer between, then a slide up and a last tick as they are nudged home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), 0.26, 1500, 800, 0.03); // 0.0 to 0.27 the shades slide down the nose
  tick(c, o, t(0.285), 0.09, 2300); // 0.28 they come to rest on the nose pads
  swish(c, o, t(0.4), 0.33, 2800, 7000, 0.026); // 0.4 to 0.72 the glint streaks across both lenses
  ding(c, o, 4200, t(0.5), 0.05, 0.3); // 0.5 the glint crosses the left lens
  ding(c, o, 5000, t(0.63), 0.05, 0.3); // 0.63 the glint crosses the right lens
  swish(c, o, t(0.76), 0.2, 800, 1700, 0.03); // 0.75 to 0.95 they are pushed back up
  tick(c, o, t(0.955), 0.1, 2600); // 0.95 the frame meets the bridge of the nose
  tick(c, o, t(1.08), 0.05, 2000); // 1.1 they settle at rest
}
