# Tribu Siga Mountaineers 🔥⛰️

The adventure journal and photo gallery of **Tribu Siga Mountaineers** — a tribe
of mountain enthusiasts from Cebu, Philippines, est. January 7, 2017.

Built with [Gatsby 5](https://www.gatsbyjs.com/) and React 18.

## Running locally

```sh
npm install
npm run develop   # dev server at http://localhost:8000
npm run build     # production build into public/
npm run serve     # serve the production build
```

## Adding a new expedition

1. Drop your best photo into `src/images/` (keep it under ~2400px wide).
2. Create a new markdown file in `content/adventures/`, e.g. `mt-kalatungan.md`:

```markdown
---
title: "Mt. Kalatungan"
date: "2026-08-15"
dateDisplay: "August 15–17, 2026"
location: "Bukidnon, Mindanao"
elevation: "2,860 MASL"
category: "Major Climb"
cover: "../../src/images/kalatungan.jpg"
excerpt: "One or two sentences shown on the expedition card."
---

Write the story of the climb here in plain markdown.
```

3. That's it — the expedition page, logbook card, gallery entry, and homepage
   stats all update automatically on the next build.

`category` can be anything, but the ones in use are: `Major Climb`,
`Day Hike`, `Overnight`, `Training`, `Milestone`.

## Project structure

- `content/adventures/` — one markdown file per expedition (the logbook)
- `src/images/` — photos
- `src/pages/` — home, expeditions, gallery, about, contact, 404
- `src/templates/adventure.js` — the expedition detail page
- `src/styles/global.css` — the whole design system (dark "alpine ember" theme)
