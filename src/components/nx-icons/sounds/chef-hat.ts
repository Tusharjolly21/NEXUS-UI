import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.33;

/** A cloth whoosh and a soft flap as the hat tips up, a gentle steam hiss that rises with the wisp, a second flap as it swings back and a soft fabric thump as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 500, 1400, 0.09); // 0.02-0.32 the hat tips up
  puff(c, o, t(0.13), 0.08, 900, 0.12, "bandpass"); // 0.13 the cloth flaps at its fastest
  swish(c, o, t(0.25), t(0.7), 4500, 7000, 0.06); // 0.25-0.95 steam hisses as the wisp rises
  swish(c, o, t(0.58), t(0.32), 1500, 500, 0.08); // 0.58-0.9 the hat swings back
  puff(c, o, t(0.72), 0.08, 800, 0.12, "bandpass"); // 0.72 the cloth flaps again
  thud(c, o, t(0.9), 140, 0.18, 0.1); // 0.9 the hat settles back on
  puff(c, o, t(0.9), 0.12, 600, 0.04, "lowpass");
}
