Make a 10-second vertical (1080×1920, 30fps) pricing video for my component library's Pro plan, clean Apple style on light #f5f5f7 with soft drifting colour light. Inter Display, bold, tabular numbers. Music: 120 BPM, a tick on every number landing and a bigger hit when the price lands.

The idea: show what people get before showing the price, using odometer digits.

0–0.5s: "Everything in Pro." rises in near the top.
0.5–4.4s: Four counters, one per beat-bar: 183 components, 92 blocks, 22 templates, 24 sounds. Each number appears huge (300px) in the centre and every digit rolls like an odometer: each digit column spins through 0–9 one or more times and settles on its target, the rightmost digits spinning longest and landing last, with vertical motion blur while they move. The word fades up under it in grey. After a short hold, the big number shrinks and slides up into a ledger at the top: rows of "number · word", numbers right-aligned in a column, each row rising in as the big number leaves.
4.4–5.4s: A hairline draws under the ledger from left to right, then "+ everything we release next" appears in a blue→purple→pink→orange gradient.
5.5–7.8s: The ledger dims and lifts. The price "$79.99" spins into the centre like a slot machine: each digit reel spins fast and stops left to right on consecutive frames, the "$" and "." stay still. Under it "once, for everything." then a lighter "or $49.99 a year". A soft white light sweeps across the price once.
8–10s: Everything dissolves; end card "Nexus UI Pro", "nexus-ui.com" in grey and a white pill "68 components free to try" with a green dot.

Make it a React component that is a pure function of time t, with the ledger items, price and copy as props.
