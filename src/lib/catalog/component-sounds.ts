import type { SoundName } from "@/lib/ui-sounds";

/**
 * The components that make interface sound, with one plain sentence for the page about what you
 * hear. Every one of them takes `enableSound` (default true), follows the site-wide sound switch
 * stays silent on hover, and makes the same sounds when it plays itself (autoplay) once the visitor has used the page. The sounds are synthesised in `@/lib/ui-sounds`.
 */
export const COMPONENT_SOUNDS: Record<string, string> = {
  "stateful-button": "Taps on press, chimes on success and bumps on error.",
  "progress-button": "Taps on press and plays a soft rising chime when the download finishes.",
  "hold-to-confirm": "Rises while you hold, chimes when it confirms and hushes if you let go early.",
  "slide-to-confirm": "Ticks softly as the knob passes each quarter of the track, chimes on confirm and bumps if the confirm fails.",
  "feedback-pill": "Pops open, taps shut, chimes when the message is sent and bumps if sending fails.",
  "copy-button": "Chimes softly when you copy; the key field also latches on and off for reveal and hide and whooshes on rotate.",
  "code-block": "Chimes softly when you press Copy.",
  "hold-to-record": "Clicks on when recording starts, off when you keep the note, hushes when you cancel and taps on play, pause and delete. The Voice Dictation variant clicks on when listening starts and off when it stops, whether you press stop or it finishes on its own; the level bars make no sound.",
  "otp-input": "Ticks quietly for each digit, chimes when the code verifies and bumps on a wrong code.",
  "password-strength": "Clicks for every character it types (and you type), then gives one soft chime the first time the password reaches Strong.",
  "signup-form": "Taps when you press submit, chimes on success and bumps on an error, with a very quiet tick when a password rule turns green.",
  "ask-nexus-input": "Whooshes when you send a question.",
  "forge-ai-command-bar": "Whooshes on send, ticks when you switch mode and taps when you pick a suggestion.",
  "seek-search": "Taps when you pick a suggestion.",
  "gooey-search-input": "Pops open, switches off on close and taps when you pick a suggestion.",
  "generate-image": "Taps when you press Generate and chimes when the picture finishes. The Image Generating variant taps when you press Variations and chimes softly when the new picture finishes forming.",
  "tick-slider": "Ticks quietly as you drag or use the keys across each tick mark.",
  "ruler-picker": "Ticks as the ruler passes each unit while you drag, fling or press arrows, and taps on a preset.",
  "time-scrubber": "Ticks for each mark crossed while you drag or fling, then one soft drop when it lands.",
  "bolting-sliders": "Lifts as the knob leaps to your click and drops when it lands.",
  "slosh-slider": "Ticks every 5% as you drag, click or use the keys.",
  "wake-slider": "Ticks each time your drag moves onto a new bar.",
  "bending-rail": "Gives a soft latch click when you grab the knob and ticks as the value changes.",
  "scrub-inputs": "Ticks for each step as you scrub a number sideways or press up and down.",
  "thermo-dial": "Ticks very quietly for each step you turn the dial.",
  "liquid-dial": "Taps when you pick an action.",
  "wheel-selector": "Ticks as each item passes the top and drops softly when the dial settles on a choice.",
  "throw-wheel": "Ticks as each card passes the front and drops softly when it settles on a card.",
  "ring-gallery": "Ticks as each card passes the front, louder the faster the ring turns, thuds softly when it settles, whooshes as it spins in and as an entry opens or closes, and flicks as you step between entries. Nothing plays on hover.",
  "cloud-sync": "Sweeps when a backup starts, taps as each app lifts off, bloops as it sinks into the cloud, then chimes with a confirmation beep when everything is up to date, with soft pings as the apps float back out.",
  "card-reader-verify": "Clicks when you pick up the card, slides and clicks as it seats in the reader, sweeps while it scans, ticks as each check completes, then chimes access granted and thumps as the Verified stamp lands; a flipped card gets two low buzzes and a shake.",
  "range-calendar": "Taps when the ribbon snaps onto each day you drag across, clinks when you grab a date and chimes when the range is set, opens softly when a quick range flows in, and flips like a page when the month turns.",
  "smart-light": "Clicks like a relay when the light goes on or off, taps glass as you dim, ticks like wood along the warmth slider, chimes when you pick a scene, and thuds softly at the end of the dimmer.",
  "global-deploy": "Sweeps when a deploy leaves its origin, taps as each region comes live, and lands with a two-note rising beep when every region is live.",
  "intelligence-glow": "Taps when you press and hold, opens with a glass chime as Writing Tools rises, clicks softly as you slide across options, sweeps while the draft shimmers, then sparkles and chimes when the rewrite lands.",
  "storage-clean": "Clicks when you press a recommendation, crumbles as the bar breaks into grains, bloops as they drop into the can, chimes when the space is freed, and pours with a soft ping when you undo.",
  "web-sling-button": "Thwips like a web-shooter as each line leaves, slaps wetly as it sticks to the button with a crackle of glue, creaks as you pull it tighter, swishes when you let go, and cracks and twangs when it snaps. An empty cartridge just clicks.",
  "pumpkin-reveal": "Off until you press the speaker button in the card. Then wind and a low drone play and each hit thuds with a creak. When it bursts the ghosts let out wobbly whooos, bats squeak and beat their wings, and spiders scuttle like legs on glass (your own track can play under it), before the offer pops out with a bell.",
  "dust-snap": "A dry finger snap, then a tremble of rustle as the word shivers. As the surface goes dark it crackles like dry earth, and every speck that breaks away is a tiny grain of sound that pans to where the front is crossing the word, so the busier the crumbling the more you hear. The cloud is a soft, gusting breath of air that swells and thins with it and drifts right with the wind. Snapping again gathers the air upward, specks land as light ticks, and the word is set down with a soft low knock. Everything is driven by the picture frame by frame. Nothing plays until the visitor has clicked or pressed a key once.",
  lightfall: "Hums a slow drone that changes with the palette: glass bells in Dusk, water drops in Tide, soft kalimba and a faint crackle in Ember. Each lane your cursor crosses plucks a note, climbing the scale left to right and louder the faster you go, a click or Space sends a run of notes falling down the wall with a swell that lands on the floor, and switching palette plays that palette's own sting. Nothing plays until the visitor has clicked or pressed a key once.",
  "shredder-delete": "Hums while the motor runs, with a pitch that follows its speed, chews while paper goes through the cutters and rustles as the strips flutter into the bin. Undo runs it in reverse. Everything is driven by the machine itself, so it stays in step with the picture.",
  "crumple-to-trash": "Swishes as the page scrunches and thumps when it lands in the bin; the shatter variant knocks as the card cracks; Undo swishes the pieces back.",
  "tear-off-ticket": "Swishes when the stub tears free and taps on New ticket.",
  "scratch-reveal": "Quiet rasps while you scratch, a chime when the foil comes off and a tap on Copy.",
  "sign-and-seal": "Knocks as the sleeve lands on your signature, then chimes when it is sealed.",
  "zipper-reveal": "Quiet ticks as you pull the zip, a latch click when it reaches the open end and a tap on Copy.",
  "slingshot-send": "Lifts as you pull the stone back and whooshes as the message flies out.",
  "sand-timer": "Taps when you turn the glass and chimes when the sand runs out, but only after you have turned it.",
  "pull-cord": "Clicks on when the light comes on and off when it goes out, once per pull.",
  "ink-theme-switch": "Clicks on when it goes dark and off when it goes back to light.",
  "box-spill": "Pops when you open the box.",
  "domino-select": "Knocks as the select-all chain starts, with soft ticks as each row's box is ticked; clicking one row knocks.",
  "capsule-toggles": "Latches on when a switch turns on and off when it turns off.",
  "animated-tabs": "Ticks when you change tab, latches on and off on the switches, pops on a new document tab, swipes on close and thumps when you drop a dragged tab.",
  "radio-cards": "Ticks when you pick a different plan.",
  "elastic-stepper": "Taps when you step up and ticks when you step down.",
  "stagger-menu": "Pops when the menu opens, ticks when you press an item, then chimes as the button shows its confirmation.",
  "command-palette": "Pops when it opens, ticks as the highlight moves by keyboard and taps when you run a command.",
  "pixel-select": "Pops when the menu opens and taps when you choose a mood.",
  "magnet-select": "Ticks when you pick a different status, by click or arrow keys.",
  "assign-picker": "Pops when you tick a person and ticks when you untick them.",
  "stretch-nav": "Ticks when you select a different item.",
  "layout-switch": "Taps when you switch layouts.",
  "swipe-stack": "Swipes a card away on throw, then chimes for approve or latches off for flag; the inbox rows do the same for archive and delete.",
  "card-stack-rotator": "Swishes when you flick a card away or press an arrow key; the rolodex ticks each time a new quote comes square.",
  "draggable-card-stack": "Lifts when you grab a card, swishes when you fling it and thumps when it settles back; the spread deck and riffle stack lift, swish and thump on their own moves.",
  "goo-reorder": "Lifts when you pick a row up, ticks as it passes each neighbour and thumps when you drop it.",
  "todo-list": "Ticks when you check a task, clicks off when you undo it and pops when you add one. The All Caught Up variant ticks softly each time you finish a task and plays a soft rising chime instead when you finish the last one.",
  "todo-tower": "Thumps when a new task lands on the pile, ticks when you complete one and swishes when you drag one out.",
  "marble-progress": "Ticks when you check a step, clicks off when you uncheck and rings a short chord when the last step completes.",
  "money-goo": "Plays a rising paid arpeggio when the money is sent.",
  "tag-pit": "Pops when you pick a pill and ticks when you put it back.",
  "fan-deck": "Ticks when you pick a colour chip.",
  "cinematic-card-deck": "Ticks each time a new card comes to the front from your drag, wheel, keys or progress pills.",
  "card-carousel-3d": "Ticks each time a new card faces you from your drag, wheel, keys, card tap or dots.",
  "circular-carousel": "Ticks each time a new card comes to the top from your drag, keys, buttons, dots or card tap.",
  "toast-stack": "Swishes when you swipe a toast away or close it, and taps its action button; Undo Toast pings on archive and drops on Undo; Promise Toast pings on Deploy, then chimes on success or bumps on error. A toast you push with { sound: true } pings, chimes or bumps by type.",
  "notification-stack": "Pings when you press a trigger and a toast arrives.",
  "like-burst": "Pops when you like and plays a quieter off when you unlike.",
  "emoji-reactions": "Pops when you pick or add a reaction and plays a quieter off when you remove yours.",
  "streak-counter": "Chimes when you log a day.",
  "dynamic-island": "Pops when the pill opens, pops quieter when it tucks away and whooshes when you stop the timer or decline the call.",
  "island-morph": "Whooshes softly when you press a state button, Accept or Decline.",
  "upload-dropzone": "Thumps when you drop or choose files, bumps on a rejected file and plays a done chord when an upload finishes. The Empty Table variant taps when you press Upload CSV or Use sample data and plays one soft rising chord when the row count finishes rolling up.",
  "upload-chips": "Taps when you drop or choose files and plays a done chord for each finished upload.",
  "pull-to-refresh": "Ticks when you pull past the release line and plays a done chord when the refresh finishes.",
  "empty-projects": "Taps when you pick a template or start over and lands the new project card with a soft drop; the fan-out on hover is silent.",
  "no-results": "Pops when the missing letter slides into the search box, ticks softly as the filter chips peel away (every other chip) and taps on Reset; typing and hover are silent.",
  "empty-chart": "Taps when you connect a source and plays a soft finished chime when the numbers arrive and the line bends into place; hovering the chart is silent.",
  "empty-team": "Drops softly as each avatar lands in its seat, taps on Send invites and gives a quiet error bump when an email is invalid or already added; the invite address types with a key click.",
  "streaming-answer": "Ticks quietly as the thinking steps finish and plays one soft completion chord when the answer has streamed in, with nothing for individual words; autoplay makes the same sounds once the visitor has used the page.",
  "diff-review": "Chimes softly when you press Accept all, switches off with a quiet click on Reject and taps when you take a single change; autoplay makes the accept sound once the visitor has used the page.",
  "agent-run": "Ticks quietly after every other step, chimes softly when the run finishes and switches off with a click when you press Stop; autoplay makes the tick and finish sounds once the visitor has used the page.",
  "ghost-autocomplete": "Gives one quiet tick when Tab accepts a suggestion and clicks for each character the draft types; autoplay makes the same sounds once the visitor has used the page.",
  "morphing-dialog": "Lifts when a dialog opens out of its button, drops when it closes by Done, Cancel, the backdrop or Escape, and taps when you confirm Delete forever.",
  "glow-button": "The Magnetic Button variant taps softly when you press it.",
  "orbital-loader": "The Step Loader variant ticks as each step finishes (every step, or every second one when the run is fast), plays a done chime when the result appears, and makes a soft off sound when you press Cancel.",
};

/**
 * The components that type text, by themselves in their demo or as you type. Each plays a key click for every
 * character that lands (and a Backspace for every one deleted) from the shared typing sound in
 * `@/lib/typing-sound`. It follows its own on/off switch and the site-wide sound switch.
 */
export const TYPING_COMPONENTS: ReadonlySet<string> = new Set([
  "typewriter-effect",
  "terminal",
  "chat-messages",
  "ask-nexus-input",
  "forge-ai-command-bar",
  "seek-search",
  "gooey-search-input",
  "ghost-autocomplete",
  "peek-login",
  "signup-form",
  "glass-login-stack",
  "password-strength",
  "phone-input",
  "otp-input",
  "feedback-pill",
  "sagging-field",
  "hop-labels",
  "empty-team",
  "morphing-dialog",
]);

export const TYPING_NOTE = "Types with a key click for every character, in sync with the text. The click stays off until you switch it on.";

export function typesFor(slug: string): boolean {
  return TYPING_COMPONENTS.has(slug);
}

export function soundFor(slug: string): string | undefined {
  return COMPONENT_SOUNDS[slug];
}

export const ENABLE_SOUND_PROP = {
  name: "enableSound",
  type: "boolean",
  defaultValue: "true",
  description:
    "Plays interface sounds on interaction. They follow the sound switch (setSoundsEnabled, on by default) and stay silent on hover. Autoplay makes the same sounds once the visitor has used the page. Pass false to silence this component.",
} as const;

/** The question every sound component answers, so the page and its search listing both carry it. */
export function soundFaq(slug: string): { q: string; a: string } | null {
  const what = COMPONENT_SOUNDS[slug];
  if (!what) return null;
  return {
    q: "Does it make sound, and how do I turn it off?",
    a: `${what} Sounds are synthesised with the Web Audio API, so there are no audio files, and they only play after a click or key press. Pass \`enableSound={false}\` to silence this component, or call \`setSoundsEnabled(false)\` from \`@/lib/ui-sounds\` to switch every sound off at once. The CLI installs \`@/lib/ui-sounds\` with the component.`,
  };
}

export type { SoundName };
