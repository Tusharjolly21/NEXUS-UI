import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.71;

/** For each of the three checkmarks: a small tick where the pencil changes direction, a scratch up the long stroke, and a rising wooden pip as the mark completes, each one a step higher than the last. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.0, 660], [0.25, 880], [0.5, 1175]].forEach(([at, f]) => {
    // the short down stroke ends and the pencil turns
    tick(c, o, t(at + 0.115), 0.08, 2600);
    // the long upstroke
    swish(c, o, t(at + 0.11), t(0.19), 2000, 5000, 0.03);
    // the checkmark completes
    blip(c, o, f, t(at + 0.29), 0.08, 0.1, f * 1.5, "triangle");
  });
}
