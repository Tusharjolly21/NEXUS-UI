import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.7;

/** A whoosh of ignition, a warm low rumble, and a scatter of crackles and pops as it flickers. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.3, 600, 0.08, "lowpass");
  swish(c, o, t(0.02), t(0.3), 400, 1800, 0.04);
  puff(c, o, t(0.05), 0.8, 250, 0.05, "lowpass");
  [0.18, 0.3, 0.37, 0.52, 0.66, 0.74].forEach((at, i) => { tick(c, o, t(at), 0.1 - i * 0.008, 3200 + (i % 3) * 800); puff(c, o, t(at), 0.02, 4800, 0.04, "highpass"); });
}
