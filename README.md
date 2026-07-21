# Tribu Siga Mountaineers 🔥⛰️

The adventure journal and photo gallery of **Tribu Siga Mountaineers** — a tribe
of mountain enthusiasts from Cebu, Philippines, est. January 7, 2017.

Built with [Gatsby 5](https://www.gatsbyjs.com/), React 18,
[Sanity](https://www.sanity.io/) as the CMS, and deployed on
[Netlify](https://www.netlify.com/) (Functions + an Edge Function power the
login-gated `/dashboard`).

## Sanity setup (one-time)

Content — expeditions, galleries, and the dashboard login user — is managed in
Sanity Studio (`/studio`), not in this repo. You need a Sanity project
(create one free at [sanity.io/manage](https://www.sanity.io/manage) if you
don't have one yet).

1. **Configure the Studio.** Copy `studio/.env.example` to `studio/.env` and
   fill in your project ID and dataset name (find them at sanity.io/manage,
   or run `npx sanity debug --secrets` after logging in).
2. **Run the Studio.**
   ```sh
   cd studio
   npm install
   npm run dev   # opens http://localhost:3333, prompts a one-time browser login
   ```
   Add an Expedition or Gallery document to confirm it saves.
3. **Make the dataset private.** The dashboard's login user is stored as a
   Sanity document (`username` + a bcrypt hash), so the dataset can no longer
   be publicly readable — otherwise anyone could query it directly and read
   the hash. From `studio/`, logged in:
   ```sh
   npx sanity dataset visibility set production private
   ```
4. **Deploy the GraphQL API.** Gatsby's Sanity source plugin reads content
   through Sanity's GraphQL API, which has to be deployed explicitly:
   ```sh
   npx sanity graphql deploy
   ```
   **Re-run this any time you change a schema file** in `studio/schemaTypes/`
   — Gatsby won't see the new fields until you do.
5. **Generate two API tokens** at sanity.io/manage → API → Tokens:
   - A **Viewer** token → `SANITY_READ_TOKEN` (Gatsby's build + the login
     function use this to read the now-private dataset).
   - An **Editor** token → `SANITY_WRITE_TOKEN` (only used server-side: the
     migration/seed scripts and the dashboard's create-content functions).
     Never exposed to the browser.
6. **Configure Gatsby.** Copy `.env.example` (repo root) to `.env.development`
   and `.env.production`, filling in the project ID, dataset, both tokens,
   and a `SESSION_SECRET` (generate one with `openssl rand -hex 32`).
7. **Seed the dashboard login user.**
   ```sh
   SEED_USERNAME=youruser SEED_PASSWORD=yourpassword npm run create-user
   ```
   Safe to re-run to reset the password later.
8. **(Optional) Migrate the old markdown posts.** The 9 original expeditions
   in `content/adventures/` (kept as a backup, no longer read by the site) can
   be imported into Sanity in one shot:
   ```sh
   npm run migrate
   ```

## Running locally

```sh
npm install
npm run develop   # Gatsby only — dashboard/login won't work (no functions)
npm run build     # production build into public/
npm run serve     # serve the production build
```

The `/login` and `/dashboard` pages depend on Netlify Functions and an Edge
Function, which plain `gatsby develop` doesn't run. For full local testing:

```sh
npm install -g netlify-cli   # one-time
netlify dev                  # proxies Gatsby's dev server + runs functions/edge functions
```

Also set the same env vars in Netlify's site settings (Site configuration →
Environment variables) for production: `SANITY_PROJECT_ID`, `SANITY_DATASET`,
`SANITY_READ_TOKEN`, `SANITY_WRITE_TOKEN`, `SESSION_SECRET`.

## Adding a new expedition or gallery

Two ways:

- **Sanity Studio** (`cd studio && npm run dev`, or your deployed Studio URL)
  — full editing, including rich-text formatting in the expedition body.
- **`/dashboard`** on the live site (`netlify dev` locally) — lists existing
  hikes/galleries in a table (View/Delete per row, fetched fresh on every
  load) with a "+ Add" button that reveals the create form, gated behind
  `/login`. Not linked from the site's navigation; go to the URL directly.
  There's no register page — the one login user is seeded via
  `npm run create-user` (step 7 above). Deleting only removes the document
  itself, not its uploaded images/video (Sanity Studio's "clean up unused
  assets" handles orphaned files if that matters to you).

Either way: **Expedition** = title, date, location, elevation, category
(`Major Climb`, `Day Hike`, `Overnight`, `Training`, or `Milestone`), excerpt,
cover image, body. **Gallery** = title, date, cover image, a set of photos
and/or videos (each with an optional caption), and an optional link to a
related expedition — which also makes the gallery show up on that
expedition's page with a click-to-expand lightbox.

Videos upload as-is (no transcoding — see `upload-video.js` below for why)
with a 20MB cap; keep clips short.

## Project structure

- `studio/` — the Sanity Studio app (schemas: `expedition`, `gallery`,
  `captionedImage`, `captionedVideo`, `user`)
- `shared/categories.js` — the 5 expedition categories, shared by the Studio
  schema, the dashboard form, and the `create-expedition` function
- `netlify/functions/` — `login`, `logout`, `create-expedition`,
  `create-gallery`, `upload-image`, `list-content` (dashboard tables),
  `delete-document` (Node; verify the session cookie and talk to Sanity with
  the write/read token)
- `netlify/edge-functions/protect-dashboard.js` — redirects to `/login` if
  the session cookie is missing/invalid before `/dashboard*` is ever served
- `netlify/edge-functions/upload-video.js` — a *separate* upload path for
  video. Regular Netlify Functions cap requests at ~6MB, far too small for
  video, so this runs as an Edge Function (Deno, no such cap) and streams
  the raw file straight through to Sanity's upload API instead.
- `content/adventures/` — the original markdown posts, kept as a backup
  (no longer read once migrated into Sanity)
- `src/images/` — static site images (hero/section photography, logo — not
  CMS content)
- `src/pages/` — home, expeditions, gallery, about, contact, login,
  dashboard, 404
- `src/templates/adventure.js` — the expedition detail page
- `scripts/migrate-to-sanity.js` — one-off importer for the old markdown posts
- `scripts/create-user.js` — seeds/resets the dashboard login user
- `src/styles/global.css` — the whole design system (dark "alpine ember" theme)
