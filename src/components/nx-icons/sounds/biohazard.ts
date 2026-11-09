import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.62;

/** A low growl that sags as the symbol winds back, a wet blorp as the hub shrinks, a growl that climbs with the turn, a bigger blorp as the hub swells and a dull knock when it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 170, t(0.04), 0.045, 0.14, 105, "sawtooth"); // 0.04-0.18 the symbol winds back
  blip(c, o, 250, t(0.18), 0.08, 0.1, 140); // 0.18 the hub shrinks to its smallest
  blip(c, o, 105, t(0.22), 0.05, 0.62, 380, "sawtooth"); // 0.22-0.84 the turn, climbing with its speed
  blip(c, o, 220, t(0.63), 0.1, 0.16, 640); // 0.63 the hub swells to its largest
  thud(c, o, t(0.86), 130, 0.1, 0.1); // 0.86 the symbol comes to rest
  puff(c, o, t(0.86), 0.09, 700, 0.03, "lowpass"); // 0.86 a wet settle
}
