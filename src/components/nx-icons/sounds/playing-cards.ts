import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A card sliding out with a papery swish, a soft pop as the heart pulses, the card whisking back and landing on the stack with a light slap, and a second smaller pop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.28), 2500, 1700, 0.032); // 0.00-0.28 front card slides out and up
  blip(c, o, 740, t(0.31), 0.04, 0.1, 900); // 0.32 heart pulses
  swish(c, o, t(0.28), t(0.28), 1700, 3200, 0.03); // 0.28-0.56 card slides back
  puff(c, o, t(0.56), 0.05, 2200, 0.07); // 0.56 card slaps down
  thud(c, o, t(0.56), 130, 0.07, 0.05); // 0.56 soft knock on the table
  blip(c, o, 880, t(0.63), 0.035, 0.1, 1050); // 0.64 heart pulses once more
}
