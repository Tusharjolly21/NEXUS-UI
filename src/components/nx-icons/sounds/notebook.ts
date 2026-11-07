import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.95;

/** A paper whoosh as the cover swings open with a soft pat when it stops (0.25), pencil scribbles in two quick zig-zag runs as each line is written (0.3 and 0.5), then the cover swishes shut and closes with a thump at 0.9. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0-0.25 cover swings open
  swish(c, o, t(0.0), t(0.26), 500, 1800, 0.05);
  // 0.25 cover reaches its open position
  thud(c, o, t(0.26), 300, 0.08, 0.06);
  // 0.3-0.5 first line is scribbled
  [0.31, 0.37, 0.43].forEach((at, i) => puff(c, o, t(at), 0.07, 5600 - i * 300, 0.04, "highpass"));
  swish(c, o, t(0.3), t(0.2), 3500, 5200, 0.018);
  // 0.5-0.7 second line is scribbled
  [0.51, 0.57, 0.63].forEach((at, i) => puff(c, o, t(at), 0.07, 5000 - i * 300, 0.04, "highpass"));
  swish(c, o, t(0.5), t(0.2), 4000, 5800, 0.018);
  // 0.63-0.9 cover swings shut
  swish(c, o, t(0.63), t(0.27), 1800, 500, 0.04);
  // 0.9 cover closes
  thud(c, o, t(0.9), 150, 0.14, 0.09);
}
