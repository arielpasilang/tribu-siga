# Tribu Siga Mountaineers 🔥⛰️

The adventure journal and photo gallery of **Tribu Siga Mountaineers** — a tribe
of mountain enthusiasts from Cebu, Philippines, est. January 7, 2017.

Built with [Next.js](https://nextjs.org/) and React, with
[Sanity](https://www.sanity.io/) as the CMS.

## Environment

Copy `.env.example` to `.env` and keep these Sanity values filled in:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_READ_TOKEN` — Viewer token. Used to read the private dataset.
- `SANITY_WRITE_TOKEN` — Editor token. Server-only. Used by the dashboard and scripts.
- `SESSION_SECRET` — signs the dashboard login cookie. Generate with `openssl rand -hex 32`.

The Studio uses `studio/.env` (`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`).

## Running locally

```sh
npm install
npm run dev       # http://localhost:3000
npm run build
npm start
```

Sanity Studio (separate app):

```sh
cd studio
npm install
npm run dev       # http://localhost:3333
```

## Dashboard

`/login` and `/dashboard` are not linked in the navigation. The login user is
stored in Sanity and seeded with:

```sh
SEED_USERNAME=youruser SEED_PASSWORD=yourpassword npm run create-user
```

Hikes, milestones, and galleries can be created in the dashboard or in Studio.

## MCP

The site exposes an MCP server for hikes, milestones, and galleries. The client ID is `tribu-siga`.

1. In Claude, add a custom connector and paste the server URL.
2. If it asks for an OAuth client ID, use `tribu-siga`.
3. Claude opens this site. Log in, choose **Approve connection**, and you return to Claude.

A pasted token from the dashboard still works. **Revoke token** disconnects approved apps and pasted tokens.

| | |
| --- | --- |
| Client ID | `tribu-siga` |
| Local server | `http://localhost:3000/api/mcp` |
| Live server | `https://tribusiga.com/api/mcp` |

Cursor can still use a pasted token in `~/.cursor/mcp.json`. Generate that token from the dashboard, under **Paste a token instead**.

```json
{
  "mcpServers": {
    "tribu-siga": {
      "url": "https://tribusiga.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

Use the local URL while `npm run dev` is running. **Revoke token** disconnects approved apps and pasted tokens.

The server can:

- `list_hikes` — climbs, training days, and overnights
- `list_milestones`
- `get_hike` — one hike or milestone by its URL slug, including the story and photo captions
- `list_galleries`
- `add_hike` — create a hike. `date` (`YYYY-MM-DD`) and `elevation` are required. `photos` is an optional gallery. Each photo is `{ "data", "filename", "caption" }` for a file dropped in chat, or `{ "url", "caption" }` for a public image URL
- `add_milestone` — create a milestone, with the same optional gallery

Image files must be JPEG, PNG, GIF, or WebP, up to 12MB. If you omit the cover, the first gallery photo is used. Deleting stays in the dashboard.

## Project structure

- `app/` — pages and dashboard API routes
- `studio/` — Sanity Studio (`expedition`, `gallery`, `user`)
- `content/adventures/` — original markdown, kept for `npm run migrate`
- `src/images/` — static photos (hero, about, logo)
