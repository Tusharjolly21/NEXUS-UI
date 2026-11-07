import { ding, plink, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three crisp paper flaps over a thin rising rustle, then a small till bell: a low pluck, a bright ring and a higher answering ring as the green centre pulses. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.09, 6400, 0.045, "highpass");
  puff(c, o, t(0.15), 0.1, 5000, 0.04, "highpass");
  puff(c, o, t(0.29), 0.08, 5800, 0.035, "highpass");
  swish(c, o, t(0.04), t(0.5), 2000, 5400, 0.02);
  plink(c, o, N.G4, t(0.44), 0.06, 0.14);
  ding(c, o, N.B6, t(0.52), 0.05, 0.5);
  ding(c, o, N.E7, t(0.66), 0.035, 0.45);
}
