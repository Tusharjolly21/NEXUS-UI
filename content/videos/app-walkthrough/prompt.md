Make a 12-second vertical (1080×1920, 30fps) product demo for my form builder FormMe that looks like a polished screen recording, but is built entirely in code. Apple-clean light UI on #f5f5f7, Inter Display, one violet accent (#5e5ce6). Music 120 BPM; every click lands on a beat and gets a soft tick.

0–1.4s: "Forms people / actually finish." in big bold type, then it lifts away as an app window (960×1280, rounded 40px, soft shadow) rises in. Window: top bar with the logo + name, three tabs (Build, Share, Responses) with a sliding white indicator, and a Publish button. Body: a white form card with title "Launch party RSVP", a grey description and an existing "Full name" field.

The camera: everything sits inside a camera group that zooms and pans like Screen Studio. It eases to 1.5× on the area the cursor is working in, follows the cursor loosely, pulls out to the Publish button, then back to full view. Use eased keyframes (zoom + focus point), never cuts.

1.7–5.3s, caption "Build." in a frosted pill at the top:
- Cursor clicks "+ Add field"; a menu springs open (Short text, Email, Choice, Rating, each with an icon); it clicks Email; the menu closes and an Email field drops in with a spring while "+ Add field" slides down.
- Cursor clicks the label and types "Your email" letter by letter with a blinking caret.
- Cursor flips the "Required" switch (knob slides, track turns green).
- Adds a Rating field the same way; cursor clicks the 4th star and the stars fill one after another with a little pop.
5.3–6.5s, caption "Share.": camera pulls out toward Publish; click; the button morphs into a green "Link copied" pill with a check.
6.5–9.7s, caption "Watch it fill.": the tab indicator slides to Responses and the body crossfades: a big counter rolls 0 → 248 responses, a five-row rating bar chart grows, and response cards (avatar initials, name, stars, "just now") drop in from the top every quarter second, pushing the list down.
9.8–12s: end card with the logo, "FormMe", a grey line "Build it, share it, watch it fill." and a pill "Link in bio".

React component, pure function of time t; app name, form title, typed label, response count and accent colour are props.
