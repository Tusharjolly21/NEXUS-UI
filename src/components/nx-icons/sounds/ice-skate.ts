import { ding, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.62;

/** A quick scrape of the blade as the skate springs up, and a crisp icy scratch with a thin metal ring as it lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.1, 5200, 0.05, "highpass"); // 0.00 the blade pushes off the ice
  swish(c, o, t(0.02), t(0.22), 1400, 2800, 0.02); // 0.02-0.24 the skate lifts on its toe
  puff(c, o, t(0.44), 0.14, 6200, 0.07, "highpass"); // 0.44 the blade lands and scratches the ice
  ding(c, o, 2950, t(0.44), 0.04, 0.3); // 0.44 the steel blade rings on landing
  swish(c, o, t(0.46), t(0.14), 6000, 3500, 0.025); // 0.46-0.60 a spray of ice flies out
}
