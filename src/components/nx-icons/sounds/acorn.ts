import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four dry wooden knocks as the acorn rocks to the end of each wobble, a papery flutter while the leaf drops away, and a tiny pop as a new leaf grows back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.18), 0.1, 3000); // 0.18 the acorn leans furthest left
  thud(c, o, t(0.18), 420, 0.1, 0.05); // 0.18 knock on the wood
  tick(c, o, t(0.36), 0.09, 2600); // 0.36 leans furthest right
  thud(c, o, t(0.36), 380, 0.08, 0.05); // 0.36 knock
  tick(c, o, t(0.54), 0.07, 2300); // 0.54 second turn left, smaller
  thud(c, o, t(0.54), 350, 0.06, 0.05); // 0.54 knock
  thud(c, o, t(0.72), 330, 0.04, 0.05); // 0.72 last small knock as it settles
  swish(c, o, t(0.13), t(0.55), 2600, 1700, 0.03); // 0.13-0.68 the leaf drifts down
  blip(c, o, 700, t(0.78), 0.04, 0.1, 1400); // 0.72-0.90 a fresh leaf grows back on the stalk
}
