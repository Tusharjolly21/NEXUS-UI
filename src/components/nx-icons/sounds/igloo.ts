import { tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 6.15;

/** The soft low rumble of a fire inside with a crackle at every flare of the warm glow in the doorway. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.8, 300, 0.035, "lowpass"); // 0.00-0.90 the fire burns low inside
  tick(c, o, t(0.144), 0.03, 3000); // 0.14 the glow dips with a crackle
  puff(c, o, t(0.32), 0.08, 1400, 0.04); // 0.32 the glow flares up
  tick(c, o, t(0.324), 0.05, 3900); // 0.32 a pop in the flare
  tick(c, o, t(0.504), 0.025, 2800); // 0.50 the glow dips again
  puff(c, o, t(0.7), 0.08, 1200, 0.03); // 0.70 the second flare
  tick(c, o, t(0.702), 0.04, 4300); // 0.70 its pop
}
