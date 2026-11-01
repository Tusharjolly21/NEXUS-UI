import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.1;

/** Two swishes passing in opposite directions, with a tick as they cross and a click at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.32), 700, 2600, 0.05);
  swish(c, o, t(0.02), t(0.32), 2600, 700, 0.04);
  tick(c, o, t(0.35), 0.12, 3400);
  blip(c, o, N.G6, t(0.35), 0.06, 0.1);
  swish(c, o, t(0.4), t(0.3), 2000, 800, 0.025);
  tick(c, o, t(0.7), 0.1, 2800);
}
