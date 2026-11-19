import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.21;

/** A metallic slosh at each shake, a sharp pop of the tab followed by a fizzing hiss, three tiny bubble pops and a small click as the tab folds back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.08, 0.18, 0.28, 0.38].forEach((at, i) => blip(c, o, 260 - (i % 2) * 40, t(at), 0.05, 0.06, 200)); // 0.08 0.18 0.28 0.38 the drink sloshes at each shake
  tick(c, o, t(0.47), 0.12, 2400); // 0.47 the tab pops open
  blip(c, o, 1250, t(0.47), 0.06, 0.05, 420); // 0.47 the gas escapes with a pop
  swish(c, o, t(0.48), t(0.42), 5200, 3800, 0.045); // 0.48-0.90 the fizz hisses out
  [[0.59, 1700], [0.66, 1900], [0.73, 1550]].forEach(([at, f]) => blip(c, o, f, t(at), 0.025, 0.03, f * 1.3)); // 0.59 0.66 0.73 the bubbles pop above the can
  tick(c, o, t(1.0), 0.04, 3600); // 1.00 the tab clicks back down
}
