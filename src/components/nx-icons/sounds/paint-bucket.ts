import { ding, plink, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two low glugs as the bucket tips, a thin whistle as the drop falls, a wet plop where it lands, then a rising swish that settles on two soft bells as the swatch fills. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.24), 260, 640, 0.03);
  blip(c, o, 196, t(0.1), 0.07, 0.12, 150, "triangle");
  blip(c, o, 233, t(0.2), 0.06, 0.1, 176, "triangle");
  swish(c, o, t(0.3), t(0.26), 2600, 900, 0.025);
  plink(c, o, N.G4, t(0.58), 0.1, 0.16);
  puff(c, o, t(0.58), 0.05, 1700, 0.04, "lowpass");
  swish(c, o, t(0.62), t(0.28), 500, 2000, 0.02);
  ding(c, o, N.B5, t(0.8), 0.06, 0.5);
  ding(c, o, N.D6, t(0.88), 0.045, 0.4);
  ding(c, o, N.A5, t(0.96), 0.035, 0.32);
}
