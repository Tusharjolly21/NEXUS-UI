import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.05;

/** A soft air swell as the pastry puffs, a cluster of brittle flaky crackles at the peak of the spread, then a thin fading hiss as the flake drifts down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.34), 500, 1700, 0.05); // 0.02 to 0.36 the body puffs up
  puff(c, o, t(0.3), 0.04, 6200, 0.07, "bandpass"); // 0.30 the segments start to crack apart
  puff(c, o, t(0.35), 0.035, 7400, 0.08, "bandpass"); // 0.35 the spread reaches its widest
  puff(c, o, t(0.4), 0.03, 5600, 0.06, "bandpass"); // 0.40 the last flake of crust lets go
  swish(c, o, t(0.44), t(0.5), 3600, 1500, 0.02); // 0.44 to 0.94 the flake falls
  puff(c, o, t(0.76), 0.05, 2600, 0.02, "lowpass"); // 0.76 body settles back
}
