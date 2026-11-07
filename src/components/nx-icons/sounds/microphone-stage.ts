import { ding, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.96;

/** A finger taps the mic with a dull thump and a breath of pop, the mic body sways with soft handling swishes, and each sound ring that draws around the capsule rings out as a round echo tone, the inner ring high and the outer ring lower. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04 the mic is tapped and starts to sway
  thud(c, o, t(0.04), 150, 0.24, 0.1);
  puff(c, o, t(0.04), 0.06, 220, 0.1, "lowpass");
  tick(c, o, t(0.05), 0.06, 2500);
  // the sway: left 0.04-0.225, right to 0.45, back to 0.675, home at 0.9
  swish(c, o, t(0.06), t(0.16), 300, 800, 0.02);
  swish(c, o, t(0.26), t(0.18), 800, 300, 0.016);
  swish(c, o, t(0.48), t(0.17), 300, 700, 0.012);
  // 0.14 and 0.54 the inner ring draws; 0.30 and 0.70 the outer ring draws
  ding(c, o, 988, t(0.14), 0.07, 0.4);
  ding(c, o, 740, t(0.3), 0.06, 0.4);
  ding(c, o, 988, t(0.54), 0.045, 0.4);
  ding(c, o, 740, t(0.7), 0.035, 0.4);
}
