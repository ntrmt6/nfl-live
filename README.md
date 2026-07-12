# NFL Live Zone

Premium, dark-themed NFL schedule + blog site built with Next.js (App Router),
Tailwind CSS, Framer Motion, and MongoDB/Mongoose.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn-style UI primitives (Radix under the hood)
- Framer Motion for animation
- Mongoose / MongoDB for Games, Blog Posts, and Contact Messages
- Tiptap WYSIWYG editor for the admin blog editor
- JWT + httpOnly cookie admin auth (no third-party auth provider required)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### Environment variables (`.env.local`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for metadata/sitemap/canonical tags |
| `NEXT_PUBLIC_SITE_NAME` | Site display name |
| `ADMIN_EMAIL` | Email used to log into `/admin` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password (generate with `node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"`) — **escape every `$` as `\$`** in `.env.local`, since Next.js's env loader otherwise expands `$2a`, `$10`, etc. as variable references and silently truncates the hash |
| `JWT_SECRET` | Long random string used to sign admin session tokens |
| `DEFAULT_AFFILIATE_URL` | Fallback stream-partner URL used by the seed script |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Your `ca-pub-...` AdSense client ID (optional) |

### Seed sample data

```bash
npm run seed
```

Populates a handful of sample games and blog posts so the homepage and blog
aren't empty during development.

### Admin dashboard

Visit `/admin/login` and sign in with `ADMIN_EMAIL` / the plaintext password
that hashes to `ADMIN_PASSWORD_HASH`. From there you can manage the game
schedule (including each game's affiliate/stream-partner URL) and publish
blog posts with the built-in WYSIWYG editor.

### AdSense

1. Replace `public/ads.txt` with the exact snippet from your AdSense account.
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT` to your `ca-pub-...` ID — the script tag
   is injected by `src/components/AdSenseScript.tsx`.
3. **The AdSense script is intentionally excluded from `/games/*` pages**
   (see that file) — those pages host the click-to-redirect stream player,
   and running Google ads alongside that interaction is the combination
   most likely to trigger an AdSense policy review or account suspension.
   Keep AdSense on genuine-content pages (home, blog, legal, contact) and
   let the game pages monetize purely through the affiliate redirect.
4. Before applying for AdSense, publish several real blog posts — reviewers
   check for "sufficient original content" across the domain, and a site
   that's only a schedule plus a stream page is a common rejection reason.
5. Do not run a second ad network (especially popunder/push-notification
   networks) on the same pages as AdSense; stacking ad networks like that
   is a frequent cause of invalid-traffic suspensions.

## Monetization design note

The live game "player" (`src/components/player/LiveStreamPlayer.tsx`) is
intentionally **not** a silent bait-and-switch: clicking it shows a labeled
"Connecting to live stream partner…" transition (with a "Sponsored Stream
Partner" tag visible up front) before opening the game's affiliate URL in a
new tab. This keeps the premium, one-tap feel the monetization strategy
needs while keeping the redirect's outcome honest, which matters for
AdSense policy compliance, affiliate network terms, and FTC disclosure
requirements.
