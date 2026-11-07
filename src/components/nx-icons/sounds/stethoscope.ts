import { ding, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.64;

/** Two heartbeats heard through the chest piece: a muffled low lub-dub each time the diaphragm ring pulses, a tiny metal tink where each ring starts, and a faint rubbery tube swish as the stethoscope sways. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.03-0.22 the stethoscope swings out
  swish(c, o, t(0.03), t(0.19), 260, 620, 0.02);
  ding(c, o, 2800, t(0.3), 0.025, 0.12); // 0.30 the first ring begins to expand
  thud(c, o, t(0.34), 68, 0.3, 0.13); // 0.34 beat 1 lub
  puff(c, o, t(0.34), 0.05, 180, 0.1, "lowpass");
  thud(c, o, t(0.45), 92, 0.21, 0.1); // 0.45 beat 1 dub: the dot is at its biggest
  puff(c, o, t(0.45), 0.04, 200, 0.07, "lowpass");
  // 0.47-0.65 the stethoscope swings back through centre
  swish(c, o, t(0.47), t(0.18), 620, 280, 0.016);
  ding(c, o, 2800, t(0.66), 0.02, 0.12); // 0.66 the second ring begins
  thud(c, o, t(0.68), 68, 0.26, 0.13); // 0.68 beat 2 lub
  puff(c, o, t(0.68), 0.05, 180, 0.09, "lowpass");
  thud(c, o, t(0.78), 92, 0.19, 0.1); // 0.78 beat 2 dub
  puff(c, o, t(0.78), 0.04, 200, 0.06, "lowpass");
  // 0.69-0.9 it settles home
  swish(c, o, t(0.7), t(0.2), 450, 250, 0.012);
}
