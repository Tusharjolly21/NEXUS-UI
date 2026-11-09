import { tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.24;

/** Four muffled fabric whumps as the hood bobs up and down and settles, with tiny metal ticks as each drawstring tip swings out and back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.07), 0.14, 500, 0.06, "lowpass"); // 0.10 hood stretches up fastest (rest 1 to 1.12)
  puff(c, o, t(0.27), 0.12, 420, 0.05, "lowpass"); // 0.30 hood drops below rest fastest
  puff(c, o, t(0.47), 0.1, 450, 0.03, "lowpass"); // 0.50 hood rises a little again
  puff(c, o, t(0.67), 0.08, 480, 0.02, "lowpass"); // 0.70 hood settles back to rest
  tick(c, o, t(0.2), 0.08, 4200); // 0.20 left string swings out
  tick(c, o, t(0.27), 0.08, 4600); // 0.27 right string swings out
  tick(c, o, t(0.35), 0.06, 3800); // 0.35 left string swings back
  tick(c, o, t(0.42), 0.06, 4200); // 0.42 right string swings back
  tick(c, o, t(0.5), 0.04, 3600); // 0.50 left string swings out again
  tick(c, o, t(0.57), 0.04, 4000); // 0.57 right string swings out again
  tick(c, o, t(0.65), 0.025, 3400); // 0.65 left string nearly still
  tick(c, o, t(0.72), 0.02, 3800); // 0.72 right string nearly still
}
