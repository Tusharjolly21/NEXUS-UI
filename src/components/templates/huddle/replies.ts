import { hashString } from "./theme";
import type { Agent, Msg } from "./types";

type Topic = keyof typeof TOPIC_WORDS;
/** What an agent says on a topic: the full answer in a DM, the short one in a huddle. */
type Take = { long: string; short: string };
/** An agent's canned lines: a hello, how it picks up from someone else, and its take on each topic. */
type Bank = { hi: string; hand: string[]; fallback: Take } & Partial<Record<Topic, Take>>;

const TOPIC_WORDS = {
  launch: ["launch", "payout", "release", "ship", "thursday", "rollout", "ready", "checklist", "go live", "announce"],
  landing: ["landing", "hero", "page", "layout", "design", "fold", "cta", "mockup", "mock up", "screen"],
  pricing: ["pricing", "price", "plan", "fee", "tier", "upgrade", "revenue", "cost per"],
  activation: [
    "activation",
    "onboarding",
    "signup",
    "sign up",
    "funnel",
    "churn",
    "retention",
    "dip",
    "drop",
    "conversion",
  ],
  seo: ["seo", "keyword", "rank", "search", "google", "blog", "organic", "traffic", "title tag"],
  security: ["security", "webhook", "auth", "token", "leak", "pii", "fraud", "vulnerab", "secure", "blocking", "risk"],
  infra: [
    "scale",
    "scaling",
    "queue",
    "latency",
    "outage",
    "deploy",
    "database",
    "cloud",
    "infra",
    "server",
    "load",
    "p95",
    "traffic spike",
  ],
  copy: ["copy", "headline", "tagline", "email", "words", "tone", "rewrite", "subject line", "wording", "write"],
};

const TOPIC_PHRASES: Record<Topic, string> = {
  launch: "the Instant Payouts launch",
  landing: "the payouts page",
  pricing: "pricing",
  activation: "activation",
  seo: "the payouts page",
  security: "the payouts flow",
  infra: "the payout queue",
  copy: "the copy",
};

export const REPLY_BANK: Record<string, Bank> = {
  mochi: {
    hi: "Hey, I'm Mochi. I design landing pages. Tell me what you're launching and I'll come back with a layout, sizes included.",
    hand: ["Agree with @{p}.", "Building on @{p}:", "Nice, @{p}. From the layout side:"],
    landing: {
      long: `Here's how I'd lay out {topic}:

1. **Hero**: one promise, one CTA. Headline at 56px, under 11 words, and the CTA is the only filled button on screen.
2. **Proof right under it**: three numbers, not logos. "$2.4M paid out this month" beats a row of grey marks.
3. **How it works**: three steps with a small animated receipt instead of icons.
4. **Fee and FAQ**: the price in plain numbers before anyone has to ask.

Max width 1120px, 120px between sections. Want me to mock the hero first?`,
      short:
        "one promise and one CTA in the hero, proof as three numbers right under it, and the fee stated before the FAQ. Five sections, no more.",
    },
    launch: {
      long: `For {topic} I'd ship three visual pieces:

- **The page**: hero with the live receipt, fee section, FAQ.
- **An in-app banner**: 48px tall, dismissible, shown only to people with an unpaid invoice older than 3 days. That's the moment instant payouts matter.
- **A social card**: 1200x630, the receipt flipping to Paid. No stock photos.

I can have all three in review by Wednesday morning.`,
      short:
        "I'd keep launch design to three pieces: the page, a dismissible in-app banner for people with unpaid invoices, and one 1200x630 social card with the receipt.",
    },
    pricing: {
      long: `Pricing pages fail when people have to do maths. I'd do:

- Two columns, not three: **Standard** (free, 2-day payouts) and **Instant** (1%, capped at $10).
- A small calculator under them. Type an invoice amount, see the fee: \`$800 → $8, paid in minutes\`.
- The cap in bold. It's the line that makes people trust the 1%.

I'd leave the monthly/annual toggle off this page entirely.`,
      short:
        "show pricing as two columns plus a tiny fee calculator, with the $10 cap in bold. People trust a fee they can work out.",
    },
    fallback: {
      long: `My design take on "{q}":

- Start from the one action you want, and make it the only filled button on screen.
- Show the thing working (a receipt, a preview, a before/after) instead of describing it.
- Cut anything that needs a tooltip to explain.

Share the current screen and I'll mark it up with sizes and spacing.`,
      short: "one filled button, show it working instead of describing it, and cut anything that needs a tooltip.",
    },
  },
  quill: {
    hi: "Hello, I'm Quill. I review copy: headlines, emails, error messages. Paste something and I'll make it shorter and clearer.",
    hand: ["@{p} is right. One word-level note:", "Small addition to @{p}:", "Agree with @{p}, and on the words:"],
    copy: {
      long: `A tighter pass on {topic}:

- **Before:** "Juniper now seamlessly enables freelancers to receive funds faster."
- **After:** "Get paid minutes after your client does."

It names the reader's moment (the client paying), not our feature. Three rules I'd hold the page to:

1. One idea per sentence.
2. Numbers over adjectives: \`1%\`, \`$10 cap\`, \`minutes\`.
3. No "seamless", "powerful" or "revolutionary". If it were, we'd show it.`,
      short: `lead with "Get paid minutes after your client does." It names the reader's moment instead of our feature, in seven words.`,
    },
    landing: {
      long: `Hero copy for {topic}, safest to boldest:

1. **Get paid minutes after your client does.**
2. **Your invoice is paid. So are you.**
3. **Stop waiting on the bank.**

I'd ship 1 and test 2. Sub-line for both: "Instant Payouts sends money to your debit card for 1%, capped at $10."

The CTA should say what happens next: \`Turn on Instant Payouts\`, not \`Get started\`.`,
      short:
        'ship "Get paid minutes after your client does." as the headline and make the CTA say what happens: "Turn on Instant Payouts".',
    },
    launch: {
      long: `Launch email, ready for review:

**Subject:** Your money, minutes after they pay
**Preview:** Instant Payouts is live. 1% per payout, capped at $10.

"When a client pays an invoice, you can now send that money to your debit card in minutes instead of two business days. It costs 1% per payout, capped at $10, and you can turn it on per invoice."

One button: \`Turn on Instant Payouts\`. No P.S., no second link.`,
      short: `for the announcement I'd use "Your money, minutes after they pay" as the subject and put the fee in the first paragraph, with one button.`,
    },
    fallback: {
      long: `A few notes on "{q}":

- Say the outcome first and the feature second.
- Swap every adjective for a number if you have one.
- Read it out loud. Wherever you take a breath, end the sentence.

Paste the draft and I'll send back a before/after with each change explained.`,
      short: "outcome first, feature second, and a number wherever there's an adjective.",
    },
  },
  sprout: {
    hi: "Hi! I'm Sprout, growth. Give me a number you want to move and I'll design the experiment to move it.",
    hand: ["Love that, @{p}.", "+1 to @{p}. Growth angle:", "Building on @{p}:"],
    activation: {
      long: `Three experiments for {topic}, ranked by ICE (impact, confidence, ease, out of 10):

1. **Send a test invoice to yourself** as step one. ICE 8/7/9. It shows the whole loop in 60 seconds.
2. **Delay bank linking** until the first invoice is paid. ICE 7/6/6. Asking for bank details before any value is where we lose people.
3. **Template picker with their trade pre-filled** (designer, developer, writer). ICE 6/7/8.

Run 1 first: two weeks, 50/50 split, success = invoice sent within 24 hours of signup.`,
      short: `the quickest win is making step one "send a test invoice to yourself". It shows the whole loop in a minute and it's cheap to test.`,
    },
    launch: {
      long: `Growth plan for {topic}:

- **Day 0:** email and in-app banner to the 18k accounts paid in the last 30 days. They feel the wait most.
- **Days 1 to 3:** an opt-in share card after each instant payout: "Paid in 4 minutes." With their referral link.
- **Day 7:** nudge anyone who turned it on but hasn't used it, with their own number: "You waited 41 hours on average last month."

Target: 12% of eligible accounts turning it on in two weeks.`,
      short:
        "aim the launch at the 18k accounts paid in the last 30 days, and add an opt-in share card after each instant payout. Target: 12% adoption in two weeks.",
    },
    pricing: {
      long: `On {topic}, I'd test the anchor rather than the fee:

- **A:** "1% per payout"
- **B:** "1% per payout, capped at $10"
- **C:** "$8 on an $800 invoice"

My bet: C wins for invoices under $1,000 (most of ours), B wins above. We can pick the anchor from each user's median invoice. Sample needed: about 3,200 viewers per arm to see a 2-point lift.`,
      short:
        'test the anchor, not the fee: "$8 on an $800 invoice" against "1%, capped at $10". Concrete examples usually win on small invoices.',
    },
    fallback: {
      long: `Here's how I'd turn "{q}" into an experiment:

1. **Hypothesis:** "If we X, then Y rises because Z."
2. **Metric:** one primary number, picked before launch.
3. **Size:** enough traffic to see a 2-point lift. If we don't have it, test something bolder.

Tell me the metric you care about and I'll draft the test card.`,
      short: "write it as a hypothesis with one metric picked up front, and size it before we start.",
    },
  },
  scout: {
    hi: "Hello. I'm Scout, I research search. Give me a page or a topic and I'll tell you what people type and what ranks.",
    hand: ["Adding to @{p}:", "@{p}'s point holds in search too:", "On top of what @{p} said:"],
    seo: {
      long: `Keyword map for {topic}:

- **get paid faster freelancer**: 2.9k/mo, difficulty 31, commercial intent. The payouts page should own this.
- \`how long does an invoice take to pay\`: 1.6k/mo, difficulty 18. A short guide that links to the page.
- \`instant payout fees\`: 720/mo, difficulty 22. Answer it in the FAQ with a table.

Internal links: one link from the invoicing guide (our top page, 9.1k visits a month) with the anchor "get paid in minutes". That alone should get the page indexed and moving within two weeks.`,
      short:
        'the page should target "get paid faster freelancer" (2.9k a month, difficulty 31) and get one internal link from the invoicing guide, our top page.',
    },
    landing: {
      long: `On-page checklist for {topic}:

1. Title: \`Instant Payouts: Get Paid in Minutes | Juniper\` (52 characters).
2. One H1 that matches the hero. Right now the hero text is an image, so there is no H1 at all.
3. FAQ marked up with FAQ schema: four questions, each answer under 50 words.
4. Hero image under 120 KB, receipt animation lazy-loaded.

The H1 is the one that really hurts. The rest is polish.`,
      short: "the hero headline is an image, so the page has no real H1. Make it text and match it to the title tag.",
    },
    launch: {
      long: `Search won't drive day-one traffic for {topic}, but it decides month three. I'd:

- Publish the page a week before the announcement so it's indexed.
- Write one guide: **How long do invoice payments take?** (1.6k/mo).
- Update the 6 help articles that still say "2 business days".

The help articles are the sneaky one. They rank, and they'd contradict the launch.`,
      short: `publish the page before the announcement so it's indexed, and fix the six help articles that still say "2 business days". They rank, and they'd contradict us.`,
    },
    fallback: {
      long: `Looking at "{q}" from a search angle:

- **Intent:** do people searching this want to learn, compare or buy? The format follows from that.
- **Gap:** the top results are usually long and generic. A short answer with a table tends to win the snippet.
- **Links:** point one high-traffic page at it.

Want me to pull volumes for the exact phrasing?`,
      short: "check the intent first, answer shorter than the top results, and point one strong page at it.",
    },
  },
  bastion: {
    hi: "Bastion. I review security. Show me a flow or a diff and I'll tell you what's blocking and what isn't.",
    hand: [
      "@{p}, fine by me, with one condition:",
      "Before we go with @{p}'s plan:",
      "No objection to @{p}. One check:",
    ],
    security: {
      long: `Review of {topic}, by risk:

**Blocking**
- Verify the webhook signature on the raw body before parsing anything.
- Rate-limit payout creation per account. 10 an hour is plenty for a human.

**Should fix**
- Bank details in logs. Mask at the logger, not at each call site:

\`\`\`ts
logger.redact(["account_number", "routing_number"], (v) =>
  "****" + String(v).slice(-4)
);
\`\`\`

**Fine as is**
- 12-hour session timeout on the dashboard.`,
      short:
        "verify webhook signatures on the raw body before parsing, and rate-limit payout creation to 10 an hour per account. Both are blocking.",
    },
    launch: {
      long: `Security gate for {topic}, four checks:

1. Fresh login (under 15 minutes) for the first instant payout to a new card.
2. 24-hour cooldown on newly added debit cards. This is the one fraudsters hate most.
3. Alert on more than 3 failed card verifications in an hour.
4. Last week's pen test: 2 medium findings, both fixed. 1 low, accepted.

If 1 and 2 are live, I'm comfortable shipping.`,
      short:
        "I need re-auth on the first payout to a new card and a 24-hour cooldown on new cards. With those live, I'm comfortable shipping.",
    },
    infra: {
      long: `Security notes on {topic}:

- The new queue gets its own IAM role. Don't reuse the export worker's; it can read every invoice PDF.
- Encrypt the dead-letter queue. Failed payout messages still carry account numbers.
- Keep the payout worker out of the public subnet.

None of this slows the rollout if it's in the same pull request.`,
      short:
        "the new queue needs its own role and an encrypted dead-letter queue. Failed messages still carry account numbers.",
    },
    fallback: {
      long: `My read on "{q}":

- **What could leak?** List the data it touches and who can read it.
- **What could be abused?** Assume someone scripts it 1,000 times a minute.
- **Blast radius?** If one key is stolen, what does it unlock?

Answer those three and I'll tell you whether it's blocking.`,
      short: "tell me what it can leak, how it could be scripted, and what one stolen key unlocks.",
    },
  },
  cirrus: {
    hi: "Hi, Cirrus here. I run the infrastructure. Ask about latency, queues, costs or deploys and you'll get config you can paste.",
    hand: ["Following @{p}:", "From the infra side, after @{p}:", "Agree with @{p}. Ops note:"],
    infra: {
      long: `Plan for {topic}:

1. Payout jobs get their own queue so batch exports can't starve them.
2. Autoscale on queue depth, not CPU: one worker per 50 waiting jobs, min 2, max 12.
3. Alert when p95 job time is over 3s for 5 minutes.

\`\`\`yaml
queues:
  payouts:
    workers: { min: 2, max: 12, per_backlog: 50 }
    timeout: 30s
  exports:
    workers: { min: 1, max: 4 }
\`\`\`

Cost: about $38 a month more at current volume.`,
      short:
        "payouts get their own queue that scales on depth (2 to 12 workers), with an alert if p95 goes over 3 seconds. About $38 a month.",
    },
    launch: {
      long: `Launch readiness for {topic}:

- **Load test:** held 40 payouts a second for 10 minutes. Forecast peak is 6.
- **Flag:** \`instant_payouts\` rolls out 5%, then 25%, then 100% over three days. Rollback is one toggle.
- **Fallback:** if the card network times out, the payout drops to standard and the user gets an email. No money gets stuck.

I'm on call Thursday from 08:00 to 20:00.`,
      short:
        "we load-tested at 40 payouts a second against a forecast of 6, and the flag rolls out 5%, 25%, 100% with a one-toggle rollback.",
    },
    security: {
      long: `The infra side of {topic}:

- Secrets move from env files to the secret manager this sprint. The payout signing key goes first.
- Rotate every 90 days, with two keys active during rotation so nothing breaks.
- Audit log on every key read, kept for a year.

@Bastion owns the policy; I'll do the plumbing.`,
      short:
        "the payout signing key moves to the secret manager this sprint, with 90-day rotation and an audit log on every read.",
    },
    fallback: {
      long: `"{q}", from the ops side:

- **Measure first:** what's p95 today, and what should it be?
- **Smallest change:** usually a queue, a cache or an index, in that order.
- **Rollback:** every change behind a flag.

Send me the service name and I'll pull the last 7 days of metrics.`,
      short: "measure p95 first, try the smallest fix (queue, cache, index), and keep it behind a flag.",
    },
  },
  pip: {
    hi: "Hi, I'm Pip. I answer questions with data, and I'll always show you the query and what it can't tell you.",
    hand: ["To back @{p} with numbers:", "The data agrees with @{p}:", "Quick numbers for @{p}:"],
    activation: {
      long: `{Topic}, last 4 weeks:

- Signed up → first invoice: **72%** (flat)
- First invoice → sent: **64%** (flat)
- Sent → bank connected: **71%**, down from 78%

The dip is mobile Safari only, from the day the bank-link redesign shipped. Desktop hasn't moved.

\`\`\`sql
select platform, browser,
  avg(bank_connected::int) as rate
from onboarding_steps
where step_date >= current_date - 28
group by 1, 2
order by rate;
\`\`\`

I'd check the redesigned bank-link sheet on an iPhone first.`,
      short:
        "it's one step: bank connection fell from 78% to 71%, only on mobile Safari, from the day the bank-link redesign shipped.",
    },
    pricing: {
      long: `What the data says about {topic}:

- Median invoice: **$640**, so the typical fee at 1% is $6.40, well under the $10 cap.
- 11% of invoices are over $1,000; those hit the cap.
- In the beta, 34% of eligible users turned it on, and used it on 58% of their paid invoices.

Projected revenue at full rollout: about **$41k a month**, plus or minus 20% depending on adoption.`,
      short: "our median invoice is $640, so the typical fee is $6.40 and only 11% of invoices hit the $10 cap.",
    },
    launch: {
      long: `Four numbers I'd watch for {topic}:

1. **Adoption:** share of eligible accounts that turn it on. Target 12% in 14 days.
2. **Usage:** instant payouts per paid invoice among adopters. Beta: 58%.
3. **Failure rate:** under 0.5%. Anything above means a card-network issue.
4. **Support tickets** tagged payouts, per 1,000 payouts. Beta: 2.1.

I'll post a summary at 10:00 and 16:00 on launch day.`,
      short:
        "I'll track adoption (target 12% in 14 days), usage among adopters, failure rate under 0.5%, and payout tickets per 1,000.",
    },
    fallback: {
      long: `To answer "{q}" properly I'd want:

- **The question as a number:** what result would change your mind?
- **A baseline:** the same metric for the last 4 weeks.
- **A cut:** platform, plan and signup month. That's where most surprises hide.

I can draft the query now and have a first chart in about ten minutes.`,
      short: "turn it into one number, get a 4-week baseline, and cut by platform before drawing conclusions.",
    },
  },
  juno: {
    hi: "Hi, I'm Juno. I keep launches on track. Tell me the date and I'll keep track of owners, deadlines and what might slip.",
    hand: ["Pulling this together:", "OK, to sum up:", "Here's the plan, then:"],
    launch: {
      long: `Where {topic} stands:

- **Done:** pricing copy, webhook fix, load test, FAQ
- **In review:** hero build (Amara), launch email (Quill)
- **Not started:** support macros (Lucia), help-article updates (Scout)

**Critical path:** support macros. If they slip, we launch with an untrained support queue.

1. Wednesday 12:00: macros drafted
2. Wednesday 15:00: go/no-go
3. Thursday 10:00: 5% rollout

Want me to send this to the team?`,
      short:
        "we're on track for Thursday 10:00. The critical path is support macros, so I'm booking a go/no-go for Wednesday at 15:00.",
    },
    pricing: {
      long: `Decision memo on {topic}:

- **Options:** 1% uncapped, 1% capped at $10, or a flat $3.
- **Recommendation:** 1% capped at $10. Simple, fair on big invoices, and it projects to about $41k a month.
- **Risk:** a competitor at 0.5%. We lead on speed and revisit the rate after 60 days of data.

I need a decision from you by Friday so Quill can finish the page.`,
      short: "recommendation is 1% capped at $10, decision needed by Friday so the page can be finished.",
    },
    activation: {
      long: `Next steps on {topic}:

1. Pip confirms the dip is mobile Safari only (today)
2. Theo reproduces it on an iPhone and estimates a fix (tomorrow)
3. Sprout pauses the onboarding test so it doesn't muddy the data (now)

I'll check back tomorrow at 11:00.`,
      short:
        "first @Pip confirms the Safari dip today, then Theo reproduces it tomorrow, and the onboarding test pauses until then.",
    },
    fallback: {
      long: `Turning "{q}" into a plan:

1. **Goal:** one sentence, with a date.
2. **Owner:** one name per task. No shared owners.
3. **Checkpoint:** when we decide if it's working.

Give me a deadline and I'll break it into tasks and owners.`,
      short: "one goal with a date, one owner per task, and a checkpoint to decide if it's working.",
    },
  },
};

export const SUGGESTIONS: Record<string, string> = {
  mochi: "Can you mock up the hero for the payouts page with the receipt on the right?",
  quill: "Give me a better headline for the instant payouts launch email.",
  sprout: "What's the fastest experiment we can run to lift activation this week?",
  scout: "Which keywords should the payouts page go after first?",
  bastion: "Is anything still blocking the launch from a security point of view?",
  cirrus: "Are we ready for launch day traffic on the payout queue?",
  pip: "Why did activation dip this week?",
  juno: "Where are we on the launch checklist for Thursday?",
  group: "Quick round: is everyone ready for Thursday's launch?",
};

export const THREAD_TITLES: Record<string, string> = {
  "Are we ready to launch Instant Payouts on Thursday?": "Launch readiness",
  "Review the pricing page before it goes live": "Pricing page review",
  "Why did activation dip on mobile this week?": "Mobile activation dip",
  "Plan the SEO for the payouts page": "Payouts page SEO",
};

export const HUDDLE_TOPICS = [
  "Are we ready to launch Instant Payouts on Thursday?",
  "Review the pricing page before it goes live",
  "Why did activation dip on mobile this week?",
  "Plan the SEO for the payouts page",
];

export function detectTopic(text: string): Topic | null {
  const lower = text.toLowerCase();
  let best: Topic | null = null;
  let bestScore = 0;
  (Object.keys(TOPIC_WORDS) as Topic[]).forEach((topic) => {
    const score = TOPIC_WORDS[topic].reduce(
      (acc, word) => acc + (lower.includes(word) ? (word.length > 5 ? 2 : 1) : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  });
  return best;
}

const shortenAsk = (text: string) => {
  const trimmed = text.trim().replace(/[?.!]+$/, "");
  const words = trimmed.split(/\s+/);
  return words.length > 9 ? words.slice(0, 9).join(" ") + "…" : trimmed;
};

const fillTopic = (template: string, topic: Topic | null, ask: string) => {
  const phrase = topic ? TOPIC_PHRASES[topic] : "this";
  return template
    .replace(/\{topic\}/g, phrase)
    .replace(/\{Topic\}/g, phrase[0].toUpperCase() + phrase.slice(1))
    .replace(/\{q\}/g, ask);
};

const capitalise = (text: string) => text[0].toUpperCase() + text.slice(1);

const ROLE_OPENERS: Record<string, string> = {
  mochi: "From the design side:",
  quill: "On the words:",
  sprout: "Growth angle:",
  scout: "From search:",
  bastion: "Security view:",
  cirrus: "Infra check:",
  pip: "What the numbers say:",
  juno: "Planning view:",
};

const fallbackPlan = (
  agent: Agent,
  ask: string,
) => `As your ${agent.role.toLowerCase() || "agent"}, here's how I'd start on "${ask}":

1. **Scope it:** what does done look like, and by when?
2. **First pass:** I'll draft something concrete you can react to, not a list of options.
3. **Tighten:** you mark it up, I turn it around within the hour.

${agent.desc ? `For context, my brief is: ${agent.desc.charAt(0).toLowerCase()}${agent.desc.slice(1)}` : "Give me a description in the editor and I'll stick to it."}`;

export function replyFor(agent: Agent, text: string, turn = 0) {
  const bank = REPLY_BANK[agent.id];
  const isGreeting = /^\s*(hi|hey|hello|yo|morning)\b/i.test(text) && text.length < 24;
  if (!bank) {
    return isGreeting
      ? `Hi, I'm ${agent.name}${agent.role ? `, your ${agent.role.toLowerCase()}` : ""}. ${agent.desc || "Tell me what you're working on."}`
      : fallbackPlan(agent, shortenAsk(text));
  }
  if (isGreeting) {
    return bank.hi;
  }
  const topic = detectTopic(text);
  const ask = shortenAsk(text);
  const topical = topic ? bank[topic] : undefined;
  const pick = turn % 3;
  return topical && pick === 0
    ? fillTopic(topical.long, topic, ask)
    : topical && pick === 2
      ? capitalise(fillTopic(topical.short, topic, ask))
      : fillTopic(bank.fallback.long, topic, ask);
}

export function huddleReplyFor(
  agent: Agent,
  text: string,
  prevId: string | null,
  order: number,
  names: Record<string, string>,
  handoffs: string[],
  generic = false,
) {
  const bank = REPLY_BANK[agent.id];
  const ask = shortenAsk(text);
  if (!bank) {
    const plan = `I'd scope "${ask}" first and send a draft today.`;
    return prevId
      ? `Building on @${names[prevId]}: as ${agent.role.toLowerCase() || "an agent"}, ${plan.charAt(0).toLowerCase()}${plan.slice(1)}`
      : `As ${agent.role.toLowerCase() || "an agent"}, ${plan.charAt(0).toLowerCase()}${plan.slice(1)}`;
  }
  const topic = detectTopic(text);
  const entry = (!generic && topic && bank[topic]) || bank.fallback;
  if (agent.id === "juno" && handoffs.length >= 2) {
    const duties: Record<string, string> = {
      mochi: "takes the page layout",
      quill: "owns the words",
      sprout: "sets up the experiment",
      scout: "handles search",
      bastion: "signs off on security",
      cirrus: "covers infra and on-call",
      pip: "builds the dashboard",
    };
    return `${bank.hand[order % bank.hand.length]}

${handoffs.map((item) => `- @${names[item]} ${duties[item] ?? "takes the next step"}`).join("\n")}

I'll check in with everyone tomorrow at 11:00.`;
  }
  const line = fillTopic(entry.short, topic, ask);
  const lowered = line.charAt(0).toLowerCase() + line.slice(1);
  if (!prevId) {
    return `${ROLE_OPENERS[agent.id]} ${/^I[ ']/.test(line) ? line : lowered}`;
  }
  const handoff = bank.hand[(order + agent.id.length) % bank.hand.length].replace("{p}", names[prevId]);
  return `${handoff} ${handoff.endsWith(":") ? (/^I[ ']/.test(line) ? line : lowered) : capitalise(line)}`;
}

export function streamTimes(text: string, seed: string, pace = 1) {
  const parts = text.split(/(\s+)/);
  const times: number[] = [];
  let clock = 0;
  let inCode = false;
  let rand = hashString(seed);
  parts.forEach((part) => {
    rand = ((rand * 9301 + 49297) % 233280) / 233280;
    if (part.includes("```")) {
      inCode = !inCode;
    }
    if (/^\s+$/.test(part)) {
      clock += part.includes("\n") ? 90 : 0;
      times.push(clock);
      return;
    }
    clock += (inCode ? 12 : 34 + rand * 30) * pace;
    if (/[.!?:]$/.test(part)) {
      clock += 120 * pace;
    } else {
      if (/,$/.test(part)) {
        clock += 50 * pace;
      }
    }
    times.push(clock);
  });
  return times;
}

export const visibleText = (msg: Msg, now: number) => {
  if (!msg.streaming || !msg.times || msg.start == null) {
    return msg.text;
  }
  const elapsed = now - msg.start;
  const parts = msg.text.split(/(\s+)/);
  let shown = 0;
  while (shown < msg.times.length && msg.times[shown] <= elapsed) {
    shown++;
  }
  return parts.slice(0, shown).join("");
};
