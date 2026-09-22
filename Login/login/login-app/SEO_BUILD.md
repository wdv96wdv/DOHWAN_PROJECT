# SEO build notes (sitemap + bot meta)

## Sitemap (A/B)

- `npm run build` → Vite writes `dist/` (copies `public/` first), then **`postbuild` runs `node sitemap.js`**.
- `sitemap.js` regenerates from Supabase and writes:
  1. `public/sitemap.xml` (source of truth for commits / local)
  2. `dist/sitemap.xml` when `dist/` exists (what Vercel deploys)
- Static URLs omit robots.txt Disallow paths: `/login`, `/join`, `/wishlist`, `/record`, etc.
- Empty marathon ids are skipped (no `/marathon/`).
- Board detail URLs are included when rows exist; robots still blocks `/boards/insert` and `/boards/update/`.

Manual regen without a full build: `npm run sitemap` (updates `public/` only if `dist/` is absent).

## Bot-first HTML (C)

- `middleware.js` detects crawler / social preview user-agents on `/marathon`, `/marathon/:id`, `/about`.
- Those requests are **rewritten** (not redirected) to `/api/seo?path=…`.
- `/api/seo` loads the deployed `index.html` shell, injects title / description / canonical / OG / Twitter to match Helmet strings, and keeps `#root` + SPA scripts so a misclassified browser still hydrates.
- Normal browsers are untouched → SPA via `vercel.json` rewrite to `index.html`.
- `/` keeps the static `index.html` OG from the positioning copy PR.

This is **not** full SSR. Follow-ups: more routes, JSON-LD in the bot shell, optional per-race OG images beyond `poster_url`.
