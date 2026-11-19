import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.99;

/** An airy sweep as the neck dips, a tiny water sip at the bottom, then a short nasal honk as the head comes back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.36), 700, 1500, 0.03); // 0.00-0.36 the long neck dips down
  blip(c, o, 1100, t(0.36), 0.05, 0.06, 1700); // 0.36 the beak dips: a little sip of water
  blip(c, o, 1500, t(0.44), 0.03, 0.05, 2200); // 0.44 a second droplet
  swish(c, o, t(0.6), t(0.25), 1300, 800, 0.02); // 0.60-0.85 the head lifts back up
  blip(c, o, 520, t(0.84), 0.06, 0.16, 440, "sawtooth"); // 0.84 a short honk as the head rises
  blip(c, o, 780, t(0.84), 0.025, 0.14, 660, "square"); // 0.84 the nasal edge of the honk
}
