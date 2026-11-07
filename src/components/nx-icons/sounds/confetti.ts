import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A hollow pop with a puff of air as the popper fires, a burst of tiny bright bits flying out, and a loose paper rustle as the pieces flutter down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 190, 0.24, 0.1);
  puff(c, o, t(0.03), 0.12, 4200, 0.07, "highpass");
  swish(c, o, t(0.04), t(0.28), 900, 4200, 0.03);
  [2900, 3500, 2500, 4000, 3200, 2700].forEach((f, i) => blip(c, o, f, t(0.1 + i * 0.06), 0.04, 0.05, f * 1.2));
  puff(c, o, t(0.4), 0.3, 6000, 0.02, "highpass");
  swish(c, o, t(0.4), t(0.4), 3200, 1000, 0.022);
  tick(c, o, t(0.88), 0.05, 4400);
}
