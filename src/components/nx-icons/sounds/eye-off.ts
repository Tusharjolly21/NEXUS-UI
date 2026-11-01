import { blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.8;

/** A soft puff of an eyelid shutting, a pen-stroke swish as the slash is drawn, and a low tick as it lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.04), 0.1, 2600, 0.035, "bandpass");
  swish(c, o, t(0.2), t(0.3), 3800, 900, 0.045);
  tick(c, o, t(0.52), 0.09, 2200);
  blip(c, o, N.E5, t(0.52), 0.04, 0.12);
}
