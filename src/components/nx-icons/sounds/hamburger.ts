import { blip, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four rising little pops as the layers lift one by one, then a soft sizzle and four low thumps as they stack back down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.G4, N.D5, N.B5, N.E6].forEach((f, i) => blip(c, o, f, t(0.03 + i * 0.07), 0.06, 0.1, f * 1.12, "triangle"));
  puff(c, o, t(0.3), 0.3, 6200, 0.022, "highpass");
  [0.52, 0.6, 0.68, 0.76].forEach((at, i) => thud(c, o, t(at), 190 - i * 28, 0.16, 0.1));
  tick(c, o, t(0.86), 0.07, 3100);
}
