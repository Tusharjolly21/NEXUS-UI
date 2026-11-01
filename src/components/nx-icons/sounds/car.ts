import { blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.73;

/** A starter motor cranking, the engine catching with a low growl, a click of the headlights, and a rev as it lunges ahead, ending on a short beep. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.07, 0.12, 0.17, 0.22].forEach((at) => tick(c, o, t(at), 0.06, 2600));
  blip(c, o, 70, t(0.04), 0.07, 0.36, 100, "sawtooth");
  puff(c, o, t(0.04), 0.4, 240, 0.06, "lowpass");
  tick(c, o, t(0.34), 0.12, 3000);
  blip(c, o, 100, t(0.38), 0.06, 0.45, 260, "sawtooth");
  swish(c, o, t(0.4), t(0.3), 600, 2400, 0.03);
  blip(c, o, N.C5, t(0.82), 0.035, 0.07, undefined, "square");
}
