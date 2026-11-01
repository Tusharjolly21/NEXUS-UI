import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 2.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.54;

/** Ignition crackle and a building rumble, a roaring lift-off, a soft return, and a puff as it touches down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0), 0.4, 2400, 0.08, "highpass");
  for (let i = 0; i < 6; i++) tick(c, o, t(0.05 + i * 0.05), 0.08, 5000);
  puff(c, o, t(0.1), 0.7, 220, 0.09, "lowpass");
  swish(c, o, t(0.42), t(0.45), 400, 3600, 0.08);
  swish(c, o, t(0.84), t(0.5), 2400, 600, 0.03);
  puff(c, o, t(1.36), 0.12, 700, 0.07, "lowpass");
  tick(c, o, t(1.36), 0.08, 2800);
}
