import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.28;

/** A busy two-voiced buzz that swells and dips as the two bees loop round the hive and fades as they settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].forEach((at, i) => blip(c, o, 210 + (i % 4) * 14, t(at), 0.035, 0.15, 230 + (i % 3) * 12, "sawtooth")); // 0.00-1.00 the first bee buzzes along its loop
  [0.06, 0.19, 0.31, 0.44, 0.56, 0.69, 0.81].forEach((at, i) => blip(c, o, 280 - (i % 3) * 10, t(at), 0.025, 0.14, 300, "sawtooth")); // 0.06-0.95 the second bee buzzes higher on its smaller loop
  puff(c, o, t(0.95), 0.08, 3000, 0.015); // 0.95 the bees settle by the hive
}
