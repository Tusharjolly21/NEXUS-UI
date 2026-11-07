import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.97;

/** Air sighs out of the cushion as it squashes, a soft whump and a short wooden creak when it bottoms out, a springy boing as it rebounds and a last faint creak and bump as the chair settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.22), 900, 260, 0.045); // 0.03-0.25 the cushion squashes, air sighs out
  thud(c, o, t(0.24), 82, 0.24, 0.2); // 0.24 the cushion bottoms out
  puff(c, o, t(0.24), 0.12, 500, 0.04, "lowpass"); // 0.24 last breath of the cushion
  [0, 1, 2].forEach((i) => blip(c, o, 205 - i * 18, t(0.25 + i * 0.035), 0.035, 0.05, 150 - i * 10, "sawtooth")); // 0.25 the wooden frame creaks under the weight
  swish(c, o, t(0.28), t(0.2), 300, 1000, 0.03); // 0.28-0.48 the cushion springs back, air breathes in
  blip(c, o, 210, t(0.46), 0.06, 0.12, 340, "triangle"); // 0.48 the rebound peaks, a springy boing
  [0, 1].forEach((i) => blip(c, o, 170 + i * 20, t(0.6 + i * 0.07), 0.025, 0.06, 140, "sawtooth")); // 0.6-0.67 the chair settles and creaks
  thud(c, o, t(0.78), 105, 0.07, 0.08); // 0.8 the chair is back on its legs
}
