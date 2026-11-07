import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.72;

/** Dry ear-flick ticks as each ear twitches, a soft blink tick, then a purr under a mew that glides up and down while the whiskers flick. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.1), 0.1, 6200); // 0.108 left ear flicks out
  tick(c, o, t(0.32), 0.09, 5400); // 0.324 left ear flicks the other way
  tick(c, o, t(0.38), 0.1, 6800); // 0.378 right ear flicks out
  tick(c, o, t(0.52), 0.08, 3600); // 0.52 eyes shut in the blink
  tick(c, o, t(0.59), 0.1, 6600); // 0.594 right ear flicks again
  blip(c, o, 480, t(0.5), 0.06, 0.18, 950, "triangle"); // 0.50-0.65 mew glides up as the whiskers start
  blip(c, o, 950, t(0.62), 0.05, 0.22, 560, "triangle"); // 0.62-0.8 mew glides back down
  [0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71, 0.74, 0.77].forEach((at) => puff(c, o, t(at), 0.03, 170, 0.045, "lowpass")); // 0.50-0.78 purr under the mew
  tick(c, o, t(0.6), 0.06, 9200); // 0.603 whiskers flick out
  tick(c, o, t(0.71), 0.06, 8600); // 0.711 whiskers flick the other way
}
