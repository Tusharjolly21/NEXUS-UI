/**
 * Everything Kiosk says lives here: the desks (categories), the writers, the stories and the legal pages.
 * Every name, story and figure is invented sample content. Replace it with your own, or load it from a CMS
 * in the same shapes.
 */

/** Which drawn scene a cover uses (`v`, 0 to 7) and in which palette (`p`, 0 to 7); see cover.tsx. */
export type CoverSpec = { v: number; p: number };

export type Category = { slug: string; name: string; blurb: string; cover: CoverSpec };

export type Story = {
  slug: string;
  title: string;
  dek: string;
  /** the category slug */
  cat: string;
  /** a name from AUTHOR_ROLES */
  author: string;
  date: string;
  /** minutes to read */
  min: number;
  cover: CoverSpec;
  views: number;
  sponsored?: boolean;
};

export type ArticleSection = {
  id: string;
  h: string;
  paras: string[];
  quote?: string;
  list?: string[];
  figure?: CoverSpec;
};

export type LegalDoc = { t: string; upd: string; s: [heading: string, body: string][] };

export const CATEGORIES: Category[] = [
  {
    slug: "business",
    name: "Business",
    blurb: "How small teams make big decisions, and what they learn after.",
    cover: {
      v: 0,
      p: 0,
    },
  },
  {
    slug: "technology",
    name: "Technology",
    blurb: "Tools, systems and the quiet engineering behind things that just work.",
    cover: {
      v: 7,
      p: 6,
    },
  },
  {
    slug: "design",
    name: "Design",
    blurb: "Objects, spaces and interfaces made with care.",
    cover: {
      v: 1,
      p: 4,
    },
  },
  {
    slug: "science",
    name: "Science",
    blurb: "Curious questions, patient answers and the odd beautiful graph.",
    cover: {
      v: 3,
      p: 2,
    },
  },
  {
    slug: "work-life",
    name: "Work Life",
    blurb: "Calmer calendars, kinder meetings and better Mondays.",
    cover: {
      v: 6,
      p: 5,
    },
  },
  {
    slug: "culture",
    name: "Culture",
    blurb: "What people are making, watching and arguing about.",
    cover: {
      v: 4,
      p: 3,
    },
  },
  {
    slug: "travel",
    name: "Travel",
    blurb: "Slow trips, cheap trains and places worth the detour.",
    cover: {
      v: 1,
      p: 0,
    },
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    blurb: "Screens, stages and the stories that stick.",
    cover: {
      v: 2,
      p: 7,
    },
  },
  {
    slug: "gaming",
    name: "Gaming",
    blurb: "Small studios, strange mechanics and games that feel new.",
    cover: {
      v: 0,
      p: 6,
    },
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    blurb: "Rooms, rituals and the details of a good day.",
    cover: {
      v: 5,
      p: 1,
    },
  },
  {
    slug: "hobbies",
    name: "Hobbies",
    blurb: "Things people do for no reason except that they love them.",
    cover: {
      v: 6,
      p: 7,
    },
  },
  {
    slug: "food",
    name: "Food",
    blurb: "Recipes, kitchens and the people behind both.",
    cover: {
      v: 2,
      p: 5,
    },
  },
];

export const AUTHOR_ROLES: Record<string, string> = {
  "Maya Lind": "Design editor",
  "Theo Ruiz": "Technology writer",
  "Ines Duarte": "Culture editor",
  "Sam Ito": "Science writer",
  "Ada Nwosu": "Business editor",
  "Leo Hart": "Travel writer",
  "Nadia Kim": "Features editor",
};

export const STORIES: Story[] = [
  {
    slug: "the-quiet-power-of-a-single-object",
    title: "The quiet power of a single object in an empty room",
    dek: "Why the most memorable spaces often hold almost nothing, and how to choose the one thing that stays.",
    cat: "design",
    author: "Maya Lind",
    date: "Oct 28, 2026",
    min: 8,
    cover: {
      v: 0,
      p: 0,
    },
    views: 48200,
    sponsored: true,
  },
  {
    slug: "outsourcing-design-without-losing-your-voice",
    title: "Outsourcing design without losing your voice",
    dek: "A practical guide to briefs, feedback and the handover, from teams who learned it the hard way.",
    cat: "business",
    author: "Ada Nwosu",
    date: "Oct 26, 2026",
    min: 11,
    cover: {
      v: 2,
      p: 1,
    },
    views: 39100,
  },
  {
    slug: "slow-trains-across-europe-on-a-budget",
    title: "Slow trains across Europe on a budget",
    dek: "Eleven days, nine cities and one rail pass. A route, a spreadsheet and what we would change.",
    cat: "travel",
    author: "Leo Hart",
    date: "Oct 24, 2026",
    min: 14,
    cover: {
      v: 5,
      p: 5,
    },
    views: 52800,
    sponsored: true,
  },
  {
    slug: "the-craft-of-modern-glass",
    title: "The craft of modern glass, from furnace to table",
    dek: "Inside a small studio where every bowl is blown, cooled and polished by the same two people.",
    cat: "science",
    author: "Sam Ito",
    date: "Oct 22, 2026",
    min: 9,
    cover: {
      v: 3,
      p: 2,
    },
    views: 31500,
  },
  {
    slug: "rendering-tools-for-stunning-visuals",
    title: "Ten rendering tools for stunning product visuals",
    dek: "We tested them all on the same scene. Here is what each one is good at, and what it costs.",
    cat: "technology",
    author: "Theo Ruiz",
    date: "Oct 20, 2026",
    min: 12,
    cover: {
      v: 7,
      p: 6,
    },
    views: 61200,
  },
  {
    slug: "the-science-of-a-restful-night",
    title: "The science behind a restful night",
    dek: "Light, temperature and timing matter more than the gadgets. What the research actually says.",
    cat: "science",
    author: "Sam Ito",
    date: "Oct 18, 2026",
    min: 10,
    cover: {
      v: 6,
      p: 7,
    },
    views: 44700,
  },
  {
    slug: "yoga-for-beginners-strength-and-flexibility",
    title: "Yoga for beginners: strength before flexibility",
    dek: "Twelve minutes, four poses and a plan that starts where your body actually is today.",
    cat: "lifestyle",
    author: "Nadia Kim",
    date: "Oct 16, 2026",
    min: 7,
    cover: {
      v: 4,
      p: 0,
    },
    views: 28900,
  },
  {
    slug: "user-testing-that-changes-the-product",
    title: "User testing that actually changes the product",
    dek: "Five sessions, one question per session and a rule about who is allowed to talk.",
    cat: "technology",
    author: "Theo Ruiz",
    date: "Oct 14, 2026",
    min: 13,
    cover: {
      v: 1,
      p: 6,
    },
    views: 37300,
  },
  {
    slug: "calm-calendars-for-busy-teams",
    title: "Calm calendars for busy teams",
    dek: "How three companies cut meetings by a third without anyone feeling out of the loop.",
    cat: "work-life",
    author: "Ada Nwosu",
    date: "Oct 12, 2026",
    min: 9,
    cover: {
      v: 7,
      p: 4,
    },
    views: 26400,
  },
  {
    slug: "statement-furniture-for-small-spaces",
    title: "Statement furniture for small spaces",
    dek: "One bold piece, everything else quiet. A room-by-room approach with real examples.",
    cat: "design",
    author: "Maya Lind",
    date: "Oct 10, 2026",
    min: 8,
    cover: {
      v: 7,
      p: 3,
    },
    views: 33600,
  },
  {
    slug: "indie-games-with-strange-mechanics",
    title: "Indie games with gloriously strange mechanics",
    dek: "Gravity you can fold, time you can paint and a puzzle game played entirely with sound.",
    cat: "gaming",
    author: "Theo Ruiz",
    date: "Oct 8, 2026",
    min: 10,
    cover: {
      v: 0,
      p: 6,
    },
    views: 41900,
  },
  {
    slug: "the-art-of-modern-dining",
    title: "The art of modern dining: design, taste, experience",
    dek: "Restaurants are designing the whole evening now, from the chair height to the last plate.",
    cat: "food",
    author: "Ines Duarte",
    date: "Oct 6, 2026",
    min: 11,
    cover: {
      v: 2,
      p: 5,
    },
    views: 29800,
  },
  {
    slug: "books-that-rewired-our-editors",
    title: "Books that quietly rewired our editors",
    dek: "Not bestsellers. The odd, specific books that changed how each of us works.",
    cat: "culture",
    author: "Ines Duarte",
    date: "Oct 4, 2026",
    min: 9,
    cover: {
      v: 6,
      p: 7,
    },
    views: 35100,
  },
  {
    slug: "film-photography-is-back",
    title: "Film photography is back, and it is slower on purpose",
    dek: "Thirty-six frames, no preview and a week to wait. Why a new generation is choosing that.",
    cat: "hobbies",
    author: "Nadia Kim",
    date: "Oct 2, 2026",
    min: 8,
    cover: {
      v: 5,
      p: 2,
    },
    views: 22700,
  },
  {
    slug: "strategic-design-drives-growth",
    title: "How strategic design drives business growth",
    dek: "Three case studies where design decisions moved revenue, and the numbers behind each one.",
    cat: "business",
    author: "Ada Nwosu",
    date: "Sep 30, 2026",
    min: 12,
    cover: {
      v: 1,
      p: 1,
    },
    views: 38800,
  },
  {
    slug: "the-new-wave-of-quiet-tv",
    title: "The new wave of quiet television",
    dek: "Shows with almost no plot are finding huge audiences. We asked the people who make them why.",
    cat: "entertainment",
    author: "Ines Duarte",
    date: "Sep 28, 2026",
    min: 10,
    cover: {
      v: 4,
      p: 7,
    },
    views: 30400,
  },
  {
    slug: "architectural-visualisation-techniques",
    title: "Modern techniques in architectural visualisation",
    dek: "Light first, materials second, cameras last. How studios build images clients trust.",
    cat: "design",
    author: "Maya Lind",
    date: "Sep 26, 2026",
    min: 13,
    cover: {
      v: 1,
      p: 3,
    },
    views: 27600,
  },
  {
    slug: "a-kitchen-for-slow-mornings",
    title: "A kitchen designed for slow mornings",
    dek: "Where the kettle lives, where the light falls and why the table matters more than the stove.",
    cat: "lifestyle",
    author: "Nadia Kim",
    date: "Sep 24, 2026",
    min: 7,
    cover: {
      v: 3,
      p: 1,
    },
    views: 24300,
  },
];

export const getCategory = (slug: string) => CATEGORIES.find((category) => category.slug === slug) ?? CATEGORIES[0]!;

export const getStory = (slug: string) => STORIES.find((story) => story.slug === slug);

export const HERO_STORIES = [STORIES[0]!, STORIES[1]!, STORIES[2]!, STORIES[4]!];

export const TICKER_ITEMS = [
  "Plotting a slow train across Europe for under 400 euros",
  "Ten rendering tools, one scene: the results",
  "Why quiet television is winning",
  "The glass studio where two people make everything",
  "A twelve-minute yoga plan that starts where you are",
];

/** The body of a story page. The sample stories share one body, worded around each story. */
export function articleBody(story: Story): ArticleSection[] {
  const topic = getCategory(story.cat).name.toLowerCase();
  return [
    {
      id: "start",
      h: "Where this started",
      paras: [
        `${story.dek} It sounds simple when you write it down. In practice it took us most of a season, a lot of conversations and more than one false start to see it clearly.`,
        `We began by asking people who work in ${topic} every day what they wish someone had told them earlier. The answers were surprisingly consistent: fewer rules, better habits, and a willingness to look closely at the small things that everyone else walks past.`,
      ],
    },
    {
      id: "what-we-learned",
      h: "What we learned",
      paras: [
        "The first lesson was about attention. The best work we saw was never the loudest. It was the work where someone had clearly decided what mattered and then cut everything else, even the good ideas.",
        "The second was about time. Almost every person we spoke to described a moment where slowing down made the result faster in the end, because they stopped redoing work they had rushed.",
      ],
      quote:
        "The difference between good and great is usually one more honest look at the thing you think is finished.",
      figure: {
        v: (story.cover.v + 3) % 8,
        p: (story.cover.p + 2) % 8,
      },
    },
    {
      id: "how-to-start",
      h: "How to start this week",
      paras: [
        "If you take one thing from this piece, make it practical. Here is the short version, in the order we would try it:",
      ],
      list: [
        "Pick one thing to improve, and write it on a card where you can see it.",
        "Give it twenty uninterrupted minutes a day for a week.",
        "Show the result to someone who will be honest, not kind.",
        "Keep what worked, drop what did not, and repeat.",
      ],
    },
    {
      id: "the-bigger-picture",
      h: "The bigger picture",
      paras: [
        `None of this is new, and that is the point. The people doing the most interesting work in ${topic} right now are not chasing trends. They are getting very good at a few fundamentals, then letting those compound.`,
        "We will keep following the people in this story, and we will report back. If you have tried any of this, or think we have it wrong, write to us. The best letters make it into the next issue.",
      ],
    },
  ];
}

export const LEGAL: Record<"privacy" | "terms", LegalDoc> = {
  privacy: {
    t: "Privacy policy",
    upd: "Updated October 1, 2026",
    s: [
      [
        "What we collect",
        "Your email address if you subscribe, and anonymous reading statistics that tell us which stories people finish. We do not sell data and we do not run third-party ad trackers.",
      ],
      [
        "How we use it",
        "To send the newsletter you asked for, to understand which stories are worth writing more of, and to keep the site secure.",
      ],
      [
        "Saved stories",
        "Stories you save are kept in your browser session on this device. They are not sent to our servers.",
      ],
      [
        "Your choices",
        "You can unsubscribe from any email in one click, and you can ask us to delete anything we hold about you by writing to privacy@kiosk.press.",
      ],
    ],
  },
  terms: {
    t: "Terms and conditions",
    upd: "Updated October 1, 2026",
    s: [
      [
        "Using Kiosk",
        "You are welcome to read, share and link to anything we publish. Please do not republish whole stories without asking first.",
      ],
      [
        "Our content",
        "Words and illustrations belong to Kiosk and its contributors. Short quotes with a link back are always fine.",
      ],
      [
        "Sponsored stories",
        "Sponsored stories are clearly labelled. Sponsors never see or approve a story before it is published.",
      ],
      [
        "Changes",
        "If these terms change in a way that matters, we will say so at the top of the page and in the next newsletter.",
      ],
    ],
  },
};
