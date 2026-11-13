import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.24;

/** A sputtering diesel engine and tyre hiss while the van bounces: dull thumps when the body drops, and small rattles when it rises. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 62, t(0.0), 0.12, 0.28, 120, "sawtooth"); // 0.00-0.28 engine catches
  swish(c, o, t(0.05), t(0.8), 400, 900, 0.018); // 0.05-0.85 tyres on gravel
  tick(c, o, t(0.22), 0.08, 1800); // 0.225 body at the top of the first hop
  thud(c, o, t(0.45), 95, 0.16, 0.13); // 0.45 body drops back
  tick(c, o, t(0.67), 0.07, 1500); // 0.675 second small hop
  thud(c, o, t(0.9), 85, 0.12, 0.12); // 0.90 body settles
}
