# Build prompt: Nimbus — weather app marketing page

Build a single-page marketing site for **Nimbus**, an invented weather app for iPhone. The feel is Apple-style: a live sky behind the hero that changes with the weather, big quiet headlines, white and light grey sections, one blue accent. A real canvas draws the sky (clouds, sun, rain, snow, lightning, and at night a star map for today's date), so the page never uses a stock photo of weather.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 plus one small scoped CSS string, with hard-coded colours so the page renders the same inside a dark-mode host. Everything sits under a `#nimbus-root` wrapper and the resets live in `@layer base` with `:where()` so utilities still win.
- Framer Motion 12 for all motion; the sky is a plain `<canvas>` with a `requestAnimationFrame` loop. No other animation or UI libraries.
- No web fonts, no remote images, no icon fetching: icons are inline SVG paths.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Nav.** Fixed and frosted. The app icon and "Nimbus" on the left; links Features, Radar, Widgets, Pricing that scroll to their sections; a small blue "Download" pill. Over the dark hero the bar is transparent with white text; over white sections it turns frosted white with grey text.
2. **Hero** on the live sky. App icon, "Nimbus for iPhone", the headline "The sky, exactly.", a white "Download free" pill and a link "See the live radar". Below, a switcher with five options: Sunny, Rain, Snow, Storm, Night. It changes the whole sky, the phone's screen and the floating widgets, and advances by itself every 4.2 seconds until the visitor picks one. A phone finish picker offers Deep Blue, Silver and Cosmic Orange. The phone shows Amsterdam with a temperature that matches the weather (Sunny 24°, Rain 14°, Storm 17°, Night 9°) and an hourly strip. Four glass widgets float around it: Next hour ("Rain in 12 min" with a bar chart), Wind (18 km/h NW with a compass), Air quality (42, Good) and UV index (6, High). On scroll the phone lifts and shrinks while the headline fades.
3. **Statement.** Large text that lights up word by word as it scrolls: "Most weather apps tell you it might rain today. Nimbus tells you it will start at 4:12 on your street, and stop eleven minutes later." Under it a bar chart of the next hour of rain, labelled 16:00, 16:12, 16:23 and 16:35.
4. **Phone stage.** "One app. Every sky." Sub: "Your forecast, the week ahead and the live radar, each one swipe apart." Three phones start stacked and fan out as the section scrolls: a 10-day forecast screen tilted left, the home screen in the middle, a radar screen tilted right.
5. **Features**, pinned. The heading "Everything the sky is planning." sits left over four titles; a phone on the right changes screen as you scroll, or when you click a title. "Rain, to the minute." (A next-hour chart for exactly where you're standing, updated every five minutes.) "Ten days, at a glance." (Highs, lows and the shape of the week in one honest list.) "Air you can read." (Air quality and pollen in plain words, so you know if it's a day for a run.) "Alerts before it hits." (Storms, ice and heat warnings for your places, with time to do something about it.) The active title is dark and shows its text; the others are grey.
6. **Radar** on black. "A radar that looks ahead." Sub: "Watch rain cross the map an hour back and two hours ahead, drawn from 5-minute radar and our own short-range model." A dotted land map with London, Brussels, Paris, Amsterdam, Hamburg and Dublin, an animated rain field in green, yellow and orange, a legend (Light to Heavy), a play and pause button, a time slider (-1h, Now, +1h, +2h) and a clock. It loops by itself while on screen.
7. **Details.** "Small details. Big difference." A bento of six tiles: "1 km" resolution ("Forecasts for your street, not your city. The park and the office get their own weather."), a ring "5 minutes" ("Fresh radar and forecasts, all day."), "No ads. No tracking. Ever.", "Feels like 27°" with a comfort bar ("Humidity makes 24° feel like 27°."), and a daylight arc ("5 h 51 min of light left today.").
8. **Widgets.** "Widgets for every screen." Sub: "Small, medium and large, on your home screen and lock screen. Keep scrolling to see them all." The section is tall and pinned; vertical scroll moves a row of widgets sideways: Amsterdam, London, Next hour, a large Reykjavik 10-day, Air quality, Sunset 20:58, and a Lock Screen set with temperature, UV and AQI rings. A thin progress bar sits underneath.
9. **Pricing.** "Free, or a little extra." Two cards. Free: "Everything you need for today." with Current conditions and hourly, 10-day forecast, Severe weather alerts, Two saved places, and an outlined "Download free" button. Nimbus+ at "$2.99/mo" ("Or $19.99 a year. Free for a month."), on a blue night-sky card, with Next-hour rain to the minute, Live radar 2 hours ahead, Air quality and pollen, Unlimited places and widgets, and a white "Try free for a month" button. Prices are sample content.
10. **Closing.** A real night sky with a moon over a photo-free band, then the sky eases to a bright day as you scroll. "Know before you go." with the app icon, a white "Download for iPhone" pill and a link "Get it for Android".
11. **Footer.** A line "Forecasts combine national weather services, radar networks and the Nimbus short-range model. Accuracy varies by location. Air quality data may be delayed by up to an hour." Four link columns (Nimbus, Support, Company, Legal), a copyright line that says this is a template and that the company name and figures are sample content, and X, Instagram and YouTube icons.

## Look

- Page white, light grey `#f5f5f7` for alternating sections, black for the radar. Ink `#1d1d1f`, secondary `#6e6e73`, tertiary `#86868b`. Accent blue `#0071e3`, used for the Download pill, the radar slider, focus rings and links.
- System font stack: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Base size 16px, letter spacing -0.011em, antialiased. Headlines weight 600 with tracking -0.045em and line-height 1.02; hero headline `clamp(56px, 9.4vw, 128px)`.
- Glass widgets: white at 12 to 18% with a backdrop blur and a 1px white ring at 25%, radius 22px. White cards radius 24px on grey.
- Sky colours by weather: sunny blue gradient, rain and storm slate greys, snow pale grey-blue, night deep navy.
- Phone bodies are real phone renders embedded as small data URIs, so the folder needs no image files. The app icon is drawn in SVG.

## Motion

- Reveals fade and rise once with ease `[0.16, 1, 0.3, 1]`; sliding selection pills use a spring (stiffness 380, damping 32).
- The sky canvas draws a cloud field from fractal noise at low resolution and scales it up, with a 30 fps cap. It eases between weather presets and stops drawing when off screen.
- Night shows real stars projected for the viewer's date, a Milky Way band, a meteor now and then and a textured moon.
- Scroll-linked values (hero phone, statement words, phone fan, pinned features, widget row) use motion values, not state.
- The radar field is computed per frame from a time value; the slider and play button control that time.

## Responsive and accessibility

- At 390px the hero stacks and the floating widgets are hidden, the features phone sits above the titles, the widget row scrolls from the same pinned section, and the page has no horizontal scroll.
- With reduced motion on, the sky draws one still frame, the weather switcher stops advancing, the radar shows a still field (the slider still redraws it) and reveals appear without movement.
- The weather switcher and phone finish picker are radio groups; the radar button is labelled "Pause radar" or "Play radar"; decorative canvases are `aria-hidden`.
- Text stays at 4.5:1 on its background.
- Focus rings are 2px blue. No random values or `window` reads during render; media queries use `useSyncExternalStore` with a server value so hydration matches.

## Final checklist

- [ ] No stock weather photos; the sky is drawn on a canvas and stops when off screen or with reduced motion.
- [ ] Brand names, prices and figures are invented and the footer says so.
- [ ] Every scroll-linked effect uses motion values; no setState inside effects without a need.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
