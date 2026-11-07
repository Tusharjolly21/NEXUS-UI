import { ding, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.21;

/** A dry slide back along the old line, a tiny metal tap where the nib touches down, then a scratchy writing run that follows the flourish and ends in a quick flick. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.24), 2400, 4200, 0.03); // 0.02-0.26 the nib slides back, the old ink is wiped
  swish(c, o, t(0.27), t(0.18), 1200, 600, 0.015); // 0.27-0.45 the nib lifts off the page
  ding(c, o, 3400, t(0.468), 0.05, 0.15); // 0.47 the nib touches down: a small metal tap
  tick(c, o, t(0.468), 0.08, 4500); // 0.47 the nib touches the paper
  [0.5, 0.56, 0.63, 0.7, 0.77, 0.84, 0.91, 0.98, 1.05, 1.12, 1.18, 1.24].forEach((at, i) => puff(c, o, t(at), 0.05, 5200 + (i % 3) * 700, 0.04 + (i % 4) * 0.005, "highpass")); // 0.50-1.24 the nib scratches along the flourish
  swish(c, o, t(0.48), t(0.78), 3000, 6200, 0.022); // 0.48-1.26 the steady scratch under it
  tick(c, o, t(1.28), 0.07, 5600); // 1.28 the last flick of the flourish
  swish(c, o, t(1.22), t(0.1), 3500, 6500, 0.03); // 1.22-1.32 the last quick stroke
}
