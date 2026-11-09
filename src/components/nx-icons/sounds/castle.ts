import { ding, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A winch ratcheting the portcullis up in dry iron clicks, a small ring at the top, a chain rush and heavy iron slam as it drops, and four quick cloth snaps from the fluttering flag. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => tick(c, o, t(0.02 + i * 0.045), 0.08, 1500 + i * 40)); // 0.02 to 0.38 the winch ratchets the gate up
  ding(c, o, 420, t(0.4), 0.04, 0.25); // 0.40 the gate reaches the top, iron rings
  swish(c, o, t(0.6), 0.38, 1100, 250, 0.045); // 0.62 to 1.0 the chain rushes as the gate drops
  thud(c, o, t(0.99), 68, 0.34, 0.18); // 1.00 the portcullis slams down
  ding(c, o, 330, t(0.99), 0.07, 0.3); // 1.00 iron bars ring
  puff(c, o, t(0.16), 0.05, 3600, 0.05, "bandpass"); // 0.18 the flag snaps up
  puff(c, o, t(0.34), 0.05, 3200, 0.045, "bandpass"); // 0.36 snaps down
  puff(c, o, t(0.52), 0.05, 3400, 0.04, "bandpass"); // 0.54 snaps up again
  puff(c, o, t(0.7), 0.05, 3000, 0.03, "bandpass"); // 0.72 last flutter
}
