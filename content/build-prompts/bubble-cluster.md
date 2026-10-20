# Bubble Cluster

Build a contact cluster: round avatar bubbles packed tightly around a centre, each sized by how close that person is, sitting on a soft liquid blob that hugs the whole cluster. A segmented control below switches between groups (Family, Close friends, Work); everyone springs to new positions and sizes, people who are not in the group shrink into the centre and fade, and the liquid backdrop re-forms around the new shape. The feel is soft and organic.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `layoutId`).
- File: `components/bubble-cluster/bubble-cluster.tsx`. Named export `BubbleCluster`, props `BubbleClusterProps`, types `ClusterPerson` and `ClusterGroups`, default data `DEFAULT_PEOPLE` and `DEFAULT_GROUPS`.

## API

- `people?: ClusterPerson[]` where `ClusterPerson = { id: string; name: string; hue: number }` (hue 0–360 tints the avatar). Default twelve people: Mom 340, Dad 210, Riya 280, Arjun 30, Sam 160, Lea 5, Kai 195, Noor 120, Maya 255, Jo 45, Teo 300, Ivy 90 (ids: mo, da, ri, ar, sa, le, ka, no, ma, jo, te, iv).
- `groups?: ClusterGroups` = `Record<string, Record<string, number>>`: group name to `{ personId: closeness 1–5 }`. Anyone missing (or 0) is hidden in that group. Default:
  - Family: mo 5, da 5, ri 4, ar 3, jo 2, iv 2
  - Close friends: sa 5, le 4, ka 4, no 3, ma 3, te 2, ar 2
  - Work: ma 5, ka 4, te 3, no 3, iv 2, jo 2, le 2, sa 1
- `autoplay?: boolean`, default `false`. Steps through the groups until someone presses the component.

## Circle packing

Compute each group's layout once (memoised on `groups`):

1. Take entries with weight > 0, sort by weight descending. Item i gets radius `r = 14 + w·7` and a start position on a spiral: angle `a = 2.4·i`, `x = cos(a)·12i`, `y = sin(a)·12i`.
2. Run 300 iterations. Each iteration: pull every item toward the centre by multiplying x and y by 0.96; then for every pair, with `d = distance` (use 0.01 if zero) and `m = rA + rB + 4`, if `d < m` push both apart along their axis by half the overlap each: `o = (m − d)/2/d`, A moves by `−(dx, dy)·o`, B by `+(dx, dy)·o`.
3. The result is `{ id, x, y, r }` relative to the centre.

## Layout and look

- Root: centred column, 16px gap: the stage, then the switcher.
- Stage: `relative`, 420×280px, `max-width: 100%`. Cluster centre is fixed at (210, 140).
- Liquid backdrop: a full-size layer with `filter: url(#gooId)` and `aria-hidden`. The filter is a gaussian blur (`stdDeviation 12`) followed by a colour matrix `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8` (alpha threshold), giving a merged blob with a crisp edge. Inside it, one absolutely positioned round span per person, colour `#0071e3` (dark `#0a84ff`), each 10px larger in radius than its avatar. Filter id from `useId()` with non-alphanumerics stripped.
- Avatars: one absolutely positioned round span per person on top. White semibold name text, centred, `overflow: hidden`. Background `linear-gradient(140deg, hsl(h 85% 68%), hsl((h+40) mod 360 75% 48%))`. A 3px separator ring as `box-shadow: 0 0 0 3px #fff` (dark `#1c1c1e`).
- Switcher: a grid with one equal column per group (`repeat(n, minmax(0,1fr))`), radius 12px, padding 3px, background `#e8e8ed` (dark `#2c2c2e`). Buttons: 32px tall, 16px horizontal padding, radius 9px, 13px medium text `#1d1d1f` (dark `#f5f5f7`). The selected thumb is a span behind the label: white (dark `#636366`), radius 9px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)` (dark `0 2px 6px rgba(0,0,0,.4)`).

## Motion

- Shared spring for bubbles: stiffness 140, damping 16 (a bit bouncy). All with `initial={false}`.
- Backdrop blob for a placed person q: `x = 210 + q.x − q.r − 10`, `y = 140 + q.y − q.r − 10`, `width = height = 2q.r + 20`, `opacity 1`. Not in group: `x 200, y 130, 20×20, opacity 0`.
- Avatar for a placed person: `x = 210 + q.x − q.r`, `y = 140 + q.y − q.r`, `width = height = 2q.r`, `opacity 1`, `fontSize = max(11, 0.42·q.r)`. Not in group: `x 204, y 134, 12×12, opacity 0, fontSize 1`. Avatars stagger by index: `delay = i·0.015s` (backdrop blobs have no delay, so the liquid leads slightly).
- Switcher thumb slides with a shared `layoutId` (scope it per instance using `useId`), spring stiffness 420, damping 32.

## Interaction and states

- State: the selected group name (initially the first). If `groups` changes and the selection no longer exists, fall back to the first group.
- Clicking a switcher button selects that group.

## Autoplay demo

With `autoplay` and at least two groups, every 2400ms select the next group (wrapping). Any `pointerdown` on the root, or a switcher click, marks it touched and the next tick clears the interval.

## Accessibility

- Avatars: `role="img"` with `aria-label={name}`; set `aria-hidden` on people not in the current group. Backdrop and filter SVG are `aria-hidden`.
- Switcher: wrapper `role="group" aria-label="Group"`; each option is a `<button type="button">` with `aria-pressed`. Focus-visible: 2px outline `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- [ ] Bubbles never overlap (at least a 4px gap) and the biggest sit nearest the centre.
- [ ] One continuous blue blob outlines the cluster, with smooth necks between bubbles.
- [ ] Switching groups springs every bubble to its new spot and size with a light overshoot; avatars trail the blob by a few milliseconds each.
- [ ] People not in a group shrink to the centre and fade out; people joining grow out of the centre.
- [ ] Name text scales with bubble size and is never below 11px for visible people.
- [ ] The switcher thumb slides between options.
- [ ] Autoplay cycles groups every 2.4s and stops after the first press.
- [ ] Two instances on one page do not share filter ids or thumb animations.
