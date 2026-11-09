import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.45;

/** A papery whoosh as the top slice lifts, a crisp lettuce rustle that flips and settles with the ruffle, a soft slide and tap for the cheese, and a pat as the top slice lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.27), 500, 1400, 0.04); // 0.00 to 0.27 the top slice lifts
  swish(c, o, t(0.2), t(0.2), 300, 700, 0.03); // 0.20 to 0.40 the cheese slides up
  puff(c, o, t(0.1), 0.05, 4200, 0.07, "bandpass"); // 0.10 the lettuce starts to ruffle
  puff(c, o, t(0.45), 0.05, 5200, 0.06, "bandpass"); // 0.45 the ruffle flips to the other phase
  swish(c, o, t(0.55), t(0.23), 1200, 400, 0.03); // 0.55 to 0.78 the top slice comes down
  tick(c, o, t(0.64), 0.08, 2400); // 0.64 the cheese lands
  thud(c, o, t(0.78), 150, 0.16, 0.08); // 0.78 the top slice lands
  puff(c, o, t(0.8), 0.04, 3800, 0.05, "bandpass"); // 0.80 the lettuce ruffle settles
  tick(c, o, t(0.95), 0.04, 1800); // 0.95 last small settle
}
