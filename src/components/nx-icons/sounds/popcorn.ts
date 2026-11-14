import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.87;

/** Two dry kernel pops each with a short rising boing, a soft airy swell as the heap puffs after each pop, and two light taps as the kernels drop back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.1), 0.16, 3200); // 0.10 kernel 1 pops out of the heap
  blip(c, o, 380, t(0.1), 0.08, 0.07, 820); // 0.10 its short boing
  puff(c, o, t(0.16), 0.12, 1700, 0.05, "lowpass"); // 0.20 the heap swells (first peak)
  tick(c, o, t(0.37), 0.18, 3900); // 0.37 kernel 2 pops out
  blip(c, o, 520, t(0.37), 0.08, 0.07, 1150); // 0.37 its boing
  puff(c, o, t(0.42), 0.12, 1500, 0.055, "lowpass"); // 0.46 the heap swells again (second peak)
  tick(c, o, t(0.7), 0.06, 2300); // 0.70 kernel 1 drops back into the heap
  puff(c, o, t(0.71), 0.06, 1200, 0.03, "lowpass"); // 0.72 the heap dips as it lands
  tick(c, o, t(0.97), 0.05, 2000); // 0.97 kernel 2 drops back in
}
