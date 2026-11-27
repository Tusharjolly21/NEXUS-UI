/** The comments themselves and the little helpers around them. Split from reddit-love.tsx so the client-side wall can read them without importing the component that renders it. */

export type Comment = {
  user: string;
  source: string;
  quote: string;
  /** Defaults to Reddit. */
  platform?: "instagram" | "x";
  verified?: boolean;
  /** Only needed when one person has more than one comment here, so each card keeps its own key. */
  id?: string;
  /** A shorter cut of a long comment for the smaller cards (pricing deck, components page), with an ellipsis where words are left out. */
  excerpt?: string;
  /** One sentence of the comment for the tightest spots (the upgrade dialog), with an ellipsis where words are left out. */
  line?: string;
  /** Slug of the component the comment is about, so that component's page can show it. */
  about?: string;
  /** The part of the comment about that component, for its page. */
  aboutCut?: string;
  /**
   * Slug of the component the comment talks about, for the "About" link on the homepage wall only (unlike
   * `about`, it doesn't put the comment on that component's page).
   */
  on?: string;
};

/** A stable key for a comment: its id if it has one, otherwise the username. */
export const commentKey = (c: Comment) => c.id ?? c.user;

const ROW_ONE: Comment[] = [
  { user: "aspiring_abundance", source: "r/SaaS", quote: "The pumpkin smash component alone deserves $79 dollars … what a perfect little detail to throw into a UI library", on: "pumpkin-reveal" },
  {
    user: "itsmeekaran",
    id: "itsmeekaran-moon-toggle",
    source: "X",
    quote:
      "This is honestly one of the cleanest toggle interactions I\u2019ve seen \u{1F319} The drag-the-moon detail with the starry background makes it feel so premium compared to a basic switch. Just checked out nexus-ui.com too, love that you\u2019re building a whole library of components like this. Bookmarked it for my next project \u{1F525}",
    excerpt:
      "This is honestly one of the cleanest toggle interactions I\u2019ve seen \u{1F319} \u2026 love that you\u2019re building a whole library of components like this. Bookmarked it for my next project \u{1F525}",
    line: "\u2026love that you\u2019re building a whole library of components like this. Bookmarked it for my next project \u{1F525}",
    about: "eclipse-toggle",
    aboutCut:
      "This is honestly one of the cleanest toggle interactions I\u2019ve seen \u{1F319} The drag-the-moon detail with the starry background makes it feel so premium compared to a basic switch. \u2026 Bookmarked it for my next project \u{1F525}",
    platform: "x",
    verified: true,
  },
  { user: "JOvertron", source: "r/webdesign", quote: "Very cool" },
  { user: "vrangnarr", source: "r/MotionDesign", quote: "Brilliant, love it!" },
  { user: "benjaminhu", source: "Reddit", quote: "This is incredibly good! Source code, please! :)" },
  { user: "DarkBlade_12", source: "Reddit", quote: "Woahh this is soo cool!! The effect of the symbiote taking over if you stay close for too long is genuinely awesome", on: "venom-button" },
  { user: "nuestras", source: "Reddit", quote: "soooooooo nice!" },
  { user: "InformationOne8032", source: "Reddit", quote: "Very very cool!" },
  { user: "dfnslvtr", source: "r/MotionDesign", quote: "ok the rope is satisfying", on: "pull-cord" },
  {
    user: "liuxueqi0044",
    source: "r/creativecoding",
    quote: "The refill meter turns this into a tiny game \u{1F602} I'd forget what I came to click and start rationing my web fluid instead.",
    on: "web-sling-button",
  },
  { user: "ssmlee04", source: "Reddit", quote: "Hi! Your website looks great" },
];

const ROW_TWO: Comment[] = [
  { user: "itsmeekaran", source: "X", quote: "This really looks cool, especially the attention to physics and smooth animations. Love seeing people build things like this", platform: "x", verified: true },
  { user: "noahelhadedy", source: "Instagram", quote: "The library looks really solid\u{1F525}", platform: "instagram", verified: true },
  { user: "Skaifessurk", source: "r/SaaS", quote: "agreed, the web needs way more goofy little interactions like that imo." },
  { user: "velvetlane1", source: "r/webdesign", quote: "yeah super creative concept tbh" },
  { user: "ds1008", source: "r/SaaS", quote: "Pretty sick UI kit" },
  { user: "BonRoxz", source: "r/webdesign", quote: "That's awesome good stuff" },
  { user: "Present_Gur1911", source: "Reddit", quote: "looks cool man. I felt like I'm poisoned with venom when the cursor is all black", on: "venom-button" },
  { user: "Actual-Deal-4445", source: "Reddit", quote: "I like it man. That's what I can call a cool project" },
  { user: "NomsaMbeki-8", source: "Reddit", quote: "This would be awesome for a game!" },
  { user: "No_Speech8210", source: "r/SideProject", quote: "Really cool concept man, the creativity is unreal" },
  { user: "webdesign_786", source: "Instagram", quote: "Fabulous work \u{1F90D}", platform: "instagram", verified: true },  {
    user: "Magnificenceure-JNR",
    source: "Reddit",
    quote: "Hey! I saw your post about creating your own end-credits scene with Doomsday x Nexus UI. That creativity is awesome!",
  },
];

const TONES: [string, string][] = [
  ["#5ac8fa", "#0071e3"],
  ["#ffb340", "#ff6b3d"],
  ["#7ee0a1", "#1fa463"],
  ["#d6a4ff", "#8e44ec"],
  ["#ff8fa3", "#ff375f"],
];

/** The avatar's two gradient colours, fixed per username. */
export function tone(user: string) {
  let h = 0;
  for (const c of user) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** Every comment, in the homepage's order. The pricing page's deck reads the same list. */
export const COMMENTS: Comment[] = [...ROW_ONE, ...ROW_TWO];
