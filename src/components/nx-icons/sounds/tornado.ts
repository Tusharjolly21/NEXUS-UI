import { blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low, growing roar that swells and fades as the funnel whips side to side, with three rubbery wobbling hums, each deeper, and a rattle of debris on the way out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 1.0, 450, 0.06, "lowpass");
  swish(c, o, t(0.06), t(0.5), 350, 1400, 0.045);
  swish(c, o, t(0.52), t(0.6), 1400, 300, 0.045);
  blip(c, o, N.A4, t(0.1), 0.05, 0.3, N.G4, "sawtooth");
  blip(c, o, N.G4, t(0.4), 0.05, 0.3, N.E4, "sawtooth");
  blip(c, o, N.E4, t(0.72), 0.05, 0.3, N.C4, "sawtooth");
  tick(c, o, t(0.95), 0.05, 2600);
  tick(c, o, t(1.05), 0.04, 3400);
}
