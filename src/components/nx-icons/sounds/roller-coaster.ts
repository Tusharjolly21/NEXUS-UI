import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.19;

/** Rattling track clacks that speed up down the drop and slow to a stop near the second hill, a rush of air, then the clacks run backwards up to the top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.173, 0.251, 0.318, 0.382, 0.449, 0.527, 0.873, 0.951, 1.018, 1.082, 1.149, 1.227].forEach((at) => tick(c, o, t(at), 0.08, 1800)); // the wheels clack over the rail joints, closer together at speed
  swish(c, o, t(0.05), t(0.6), 700, 2600, 0.04); // 0.05-0.65 air rushes past on the drop and the climb
  swish(c, o, t(0.75), t(0.6), 2400, 700, 0.03); // 0.75-1.35 the rush again on the way back
  thud(c, o, t(1.4), 150, 0.07, 0.1); // 1.40 the car stops at the top
}
