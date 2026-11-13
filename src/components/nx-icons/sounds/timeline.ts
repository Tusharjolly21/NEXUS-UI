import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three soft bloops climbing in pitch as each node swells into place, a small drip sweep down each connector, and a light tick as each line of text finishes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 520, t(0.2), 0.07, 0.12, 760, "sine"); // 0.245 first node swells into place
  swish(c, o, t(0.12), t(0.2), 2600, 1400, 0.02); // 0.12-0.32 first connector draws down
  tick(c, o, t(0.35), 0.05, 3600); // 0.35 first line of text is done
  blip(c, o, 650, t(0.5), 0.07, 0.12, 900, "sine"); // 0.545 second node swells
  swish(c, o, t(0.42), t(0.2), 2600, 1400, 0.02); // 0.42-0.62 second connector draws down
  tick(c, o, t(0.65), 0.05, 3900); // 0.65 second line of text is done
  blip(c, o, 780, t(0.8), 0.07, 0.12, 1060, "sine"); // 0.845 third node swells
  tick(c, o, t(0.95), 0.06, 4200); // 0.95 last line of text is done
}
