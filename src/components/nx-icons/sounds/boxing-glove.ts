import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.81;

/** A cloth rub as the glove pulls back, a sharp whoosh up and a heavy leather slap with a thump at the moment it lands, then a soft fabric settle as it drops back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.06), t(0.2), 300, 700, 0.06); // 0.06 the glove draws back
  swish(c, o, t(0.26), t(0.15), 700, 3500, 0.08); // 0.26 the punch, fastest at 0.34
  thud(c, o, t(0.405), 75, 0.2, 0.2); // 0.41 the glove hits at the top of the punch
  puff(c, o, t(0.405), 0.06, 1200, 0.1, "bandpass"); // 0.41 leather slap
  tick(c, o, t(0.405), 0.1, 2400); // 0.41 snap of the impact
  tick(c, o, t(0.44), 0.05, 6500); // 0.44 impact lines burst out
  swish(c, o, t(0.55), t(0.3), 1200, 400, 0.035); // 0.55 the glove drops back
  puff(c, o, t(0.88), 0.07, 900, 0.04, "lowpass"); // 0.88 it settles at rest
}
