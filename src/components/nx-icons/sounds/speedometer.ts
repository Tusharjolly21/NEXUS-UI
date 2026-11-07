import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.64;

/** An engine that revs up with the needle (low sawtooth growl and rushing air), a click on each of four marks as they light, a small wobble as the needle overshoots and settles, then the engine winding down as the needle drops and a soft knock when it rests. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04-0.42 needle sweeps up: engine revs, air rushes
  blip(c, o, 85, t(0.04), 0.05, 0.4, 400, "sawtooth");
  blip(c, o, 170, t(0.04), 0.025, 0.4, 800, "triangle");
  swish(c, o, t(0.04), t(0.38), 700, 3200, 0.04);
  // 0.14 / 0.24 / 0.33 / 0.42 the four marks light as the needle passes
  [0.14, 0.24, 0.33, 0.42].forEach((at, i) => tick(c, o, t(at), 0.1, 3400 + i * 500));
  // 0.42-0.68 needle overshoots 115 deg, dips to 106 (0.55), rises to 112 (0.68): engine holds and wobbles
  blip(c, o, 400, t(0.43), 0.035, 0.12, 340, "sawtooth");
  blip(c, o, 340, t(0.55), 0.035, 0.12, 390, "sawtooth");
  // 0.68-1.1 needle drops back to rest
  blip(c, o, 390, t(0.69), 0.045, 0.4, 85, "sawtooth");
  swish(c, o, t(0.69), t(0.4), 2600, 500, 0.035);
  // 1.08 needle comes to rest on its pin
  thud(c, o, t(1.08), 150, 0.14, 0.08);
}
