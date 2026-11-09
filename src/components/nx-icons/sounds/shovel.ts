import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Gritty soil as the blade pushes in, a heavy thump when it bottoms out, three light taps of clods landing on the steel, an air flick as it lifts, and a scatter of grit as the soil is tossed and falls. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.1), t(0.2), 900, 0.07, "lowpass"); // 0.10-0.30 the blade is pushed into the ground
  thud(c, o, t(0.3), 74, 0.34, 0.16); // 0.30 the blade bottoms out in the soil
  puff(c, o, t(0.3), t(0.07), 1500, 0.07); // 0.30 crunch of soil
  tick(c, o, t(0.32), 0.06, 1900); // 0.32 first clod lands on the blade
  tick(c, o, t(0.35), 0.05, 2300); // 0.35 second clod
  tick(c, o, t(0.38), 0.05, 2000); // 0.38 third clod
  swish(c, o, t(0.42), t(0.28), 420, 1600, 0.05); // 0.42-0.70 the blade lifts and flicks
  puff(c, o, t(0.62), t(0.18), 2600, 0.03, "highpass"); // 0.62 soil is tossed off the blade
  puff(c, o, t(0.8), t(0.12), 1900, 0.02); // 0.80 grit patters down
}
