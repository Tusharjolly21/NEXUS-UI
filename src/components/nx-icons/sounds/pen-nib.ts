import { ding, plink, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A small dip plink, then a scratchy run of quick nib strokes with a thin rising line of ink under them, closing on a glassy two-note flourish. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.2), 2200, 700, 0.025);
  plink(c, o, N.D5, t(0.3), 0.08, 0.16);
  [0.4, 0.5, 0.6, 0.7, 0.8, 0.9].forEach((at, i) => puff(c, o, t(at), 0.05, 4800 + i * 300, 0.04, "highpass"));
  blip(c, o, 600, t(0.4), 0.03, 0.55, 1250, "sine");
  ding(c, o, N.A6, t(1.0), 0.07, 0.45);
  ding(c, o, N.G7, t(1.1), 0.05, 0.4);
}
