import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.0;

/** A fast zip as the tape snaps back into the case, a metal knock when the hook hits it, then a ratchet of clicks that slow down as the tape is drawn out, ending with a firm click of the hook at full length. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 700, 3000, 0.05); // 0.00-0.20 the tape zips back into the case
  thud(c, o, t(0.2), 210, 0.1, 0.06); // 0.20 the hook hits the case
  tick(c, o, t(0.2), 0.1, 3000); // 0.20 metal knock
  [0.391, 0.445, 0.503, 0.566, 0.634, 0.712, 0.806].forEach((at, i) => tick(c, o, t(at), 0.08, 1800 + i * 150)); // 0.34-1.00 the ratchet slows as the tape is pulled out
  swish(c, o, t(0.34), t(0.5), 1800, 700, 0.015); // 0.34-0.84 tape sliding over the case lip
  thud(c, o, t(1.0), 190, 0.1, 0.06); // 1.00 the hook reaches full length
  tick(c, o, t(1.0), 0.12, 2400); // 1.00 final click
}
