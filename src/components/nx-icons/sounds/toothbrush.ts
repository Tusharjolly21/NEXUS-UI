import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.33;

/** Five dry friction strokes of bristles as the brush scrubs back and forth, then three small wet pops as the foam bubbles burst. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.0, 0.18, 0.36, 0.54, 0.72].forEach((at, i) => puff(c, o, t(at + 0.02), 0.12, i % 2 ? 4200 : 5200, 0.045)); // 0.00-0.90 one scrub per stroke, bristles rasping on the teeth
  blip(c, o, 900, t(0.7), 0.05, 0.05, 1500); // 0.70 the first foam bubble pops
  blip(c, o, 1100, t(0.85), 0.045, 0.05, 1800); // 0.85 the second bubble pops
  blip(c, o, 760, t(1.0), 0.04, 0.05, 1300); // 1.00 the third bubble pops
}
