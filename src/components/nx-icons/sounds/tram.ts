import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two crackling electric zaps that race away along the wire as the sparks fly (at the start and again at 0.34), and dry relay clicks each time a headlight blinks off, left, right, left, right. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.00 first pair of sparks leaves the pantograph and runs out along the wire
  blip(c, o, 3600, t(0.0), 0.035, 0.22, 900, "sawtooth");
  puff(c, o, t(0.0), 0.05, 6200, 0.06, "highpass");
  puff(c, o, t(0.07), 0.04, 5200, 0.045, "highpass");
  puff(c, o, t(0.15), 0.05, 4400, 0.035, "highpass");
  // 0.20 left headlight blinks off
  tick(c, o, t(0.2), 0.11, 3800);
  // 0.34 second pair of sparks runs out
  blip(c, o, 3000, t(0.34), 0.03, 0.22, 800, "sawtooth");
  puff(c, o, t(0.34), 0.05, 5800, 0.05, "highpass");
  puff(c, o, t(0.42), 0.04, 4800, 0.04, "highpass");
  // 0.40 right headlight blinks off
  tick(c, o, t(0.4), 0.1, 2600);
  // 0.60 left headlight blinks off again
  tick(c, o, t(0.6), 0.1, 3800);
  // 0.80 right headlight blinks off again
  tick(c, o, t(0.8), 0.1, 2600);
}
