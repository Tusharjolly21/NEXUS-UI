import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.72;

/** An engine that revs up with the needle (a low sawtooth growl with rushing air), a click as the coloured zone flashes, a small wobble as the needle overshoots and settles, then the engine winding down as it drops and a soft knock when it rests. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04-0.42 the needle revs up the dial
  blip(c, o, 85, t(0.04), 0.05, 0.4, 420, "sawtooth");
  blip(c, o, 170, t(0.04), 0.025, 0.4, 840, "triangle");
  swish(c, o, t(0.04), t(0.38), 700, 3200, 0.04);
  // 0.42 the needle peaks in the coloured zone and the zone flashes
  tick(c, o, t(0.42), 0.12, 3600);
  // 0.55 the needle dips back
  blip(c, o, 410, t(0.55), 0.035, 0.12, 340, "sawtooth");
  // 0.68 the needle rises a little again
  blip(c, o, 350, t(0.68), 0.03, 0.12, 390, "sawtooth");
  // 0.68-1.1 the needle drops back to zero
  blip(c, o, 390, t(0.7), 0.045, 0.38, 85, "sawtooth");
  swish(c, o, t(0.7), t(0.38), 2600, 500, 0.035);
  // 1.1 the needle comes to rest
  thud(c, o, t(1.08), 150, 0.14, 0.08);
}
