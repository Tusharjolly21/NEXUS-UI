import { plink, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.83;

/** A paper flick as the page lifts, a dry tick as the folded corner redraws, then a springy note that leaps up as the plus spins in and a bright pair of pings as it pops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.08, 3600, 0.04, "highpass");
  tick(c, o, t(0.12), 0.08, 4200);
  blip(c, o, N.E5, t(0.22), 0.07, 0.3, N.A5, "triangle");
  swish(c, o, t(0.2), t(0.3), 600, 2600, 0.025);
  plink(c, o, N.B5, t(0.5), 0.08, 0.14);
  plink(c, o, N.E6, t(0.58), 0.06, 0.22);
}
