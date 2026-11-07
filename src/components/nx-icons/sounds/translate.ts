import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.94;

/** Papery tile flips with a soft chime at the moment each tile swaps its symbol (top tile 0.19, bottom tile 0.29, then back at 0.83 and 0.93), and a light tap as each tile lands flat. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02-0.34 top tile flips, 0.12-0.44 bottom tile flips
  swish(c, o, t(0.02), t(0.32), 800, 2600, 0.04);
  swish(c, o, t(0.12), t(0.32), 600, 1900, 0.034);
  // 0.19 top tile edge-on: A turns to the ideograph
  ding(c, o, 1319, t(0.19), 0.05, 0.3);
  // 0.29 bottom tile edge-on
  ding(c, o, 988, t(0.29), 0.05, 0.3);
  // 0.36 / 0.46 tiles land flat
  tick(c, o, t(0.36), 0.05, 3400);
  tick(c, o, t(0.46), 0.05, 3000);
  // 0.66-0.98 top tile flips back, 0.76-1.08 bottom tile flips back
  swish(c, o, t(0.66), t(0.32), 2600, 800, 0.04);
  swish(c, o, t(0.76), t(0.32), 1900, 600, 0.034);
  // 0.83 and 0.93 the symbols swap back
  ding(c, o, 988, t(0.83), 0.05, 0.3);
  ding(c, o, 1319, t(0.93), 0.05, 0.25);
  // 1.0 / 1.1 tiles land flat
  tick(c, o, t(1.0), 0.05, 3400);
  tick(c, o, t(1.1), 0.05, 3000);
}
