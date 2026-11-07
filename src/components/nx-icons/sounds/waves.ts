import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 5.17;

/** Three rolling swells of water, one after another, each rising and falling with the wave row that slides along, then a soft fizz of foam as each one settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.7), 220, 800, 0.07); // 0.00-0.70 top wave row rolls through
  swish(c, o, t(0.14), t(0.7), 300, 1100, 0.065); // 0.14-0.84 middle row rolls
  swish(c, o, t(0.28), t(0.7), 400, 1500, 0.06); // 0.28-0.98 bottom row rolls
  puff(c, o, t(0.62), 0.14, 3200, 0.02, "highpass"); // 0.70 top row settles: foam
  puff(c, o, t(0.76), 0.14, 3000, 0.02, "highpass"); // 0.84 middle row settles
  puff(c, o, t(0.9), 0.16, 2800, 0.02, "highpass"); // 0.98 bottom row settles
}
