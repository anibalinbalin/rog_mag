# olivera_mag — Olivera magazine site

**Revista de Derecho Comercial y de la Empresa** — the 3rd of three sister sites using the same
self-hosted TinaCMS setup. The site is **built and live**; Tina is **wired** (one env var pending,
see below).

- **Production:** https://rog-mag.vercel.app (every.to-style layout, sections/authors/issues)
- **Admin:** https://rog-mag.vercel.app/admin (Clerk Google login, allowed emails only)
- **GitHub:** `anibalinbalin/rog_mag` — pushes to `main` auto-deploy on Vercel
- **Vercel:** project `rog-mag`, team scope `anibals-projects-c9882c4c`
- **Local dir:** `/mnt/data/sites-sync/2026/olivera_mag/` (app at repo root)
- **Local dev:** `bun run dev` (Tina + Next on port 3003) or `bun run dev:next` (Next only).
  Tailscale URL: https://claude-code-sec.tailf626.ts.net:3003/

## Architecture

- Next.js 15 App Router + Tailwind v4 + TypeScript, bun.
- **Content (markdown, flat frontmatter via gray-matter):**
  - `content/blog/*.md` → posts (title/category/section/excerpt/author/authorRole/date). URL = `/publicaciones/<filename>`
  - `content/authors/*.md` → authors (name/role/institution/linkedin/sections + bio body). URL = `/autores/<filename>`
  - `content/issues/*.md` → journal issues (number/year/volume/issue/season/articleCount/current/doctrina[]/deInteres[]). URL = `/revista/<filename>`
- **Readers:** `lib/blog.ts`, `lib/authors.ts`, `lib/issues.ts`, `lib/sections.ts` (sections are code, not content)
- **Design:** Belen owns colors/typography (`--color-*` tokens, Source Serif 4 + Inter) — never change them.
  Structure follows every.to: sections institutional, authors personal.

## TinaCMS (self-hosted, wired 2026-06-02)

- **Collections:** `tina/collection/{post,author,issue}.ts` — Spanish labels, map the frontmatter 1:1.
- **Config:** `tina/config.tsx` (Clerk auth in prod, LocalAuthProvider in dev), `tina/database.ts`
  (Mongo datalayer + GitHub provider; **falls back to local DB when MONGODB_URI is absent** — the
  elemental pattern, so deploys never fail on a missing URI), `pages/api/tina/[...routes].ts` (backend).
- **dbName:** `olivera_mag` on shared Atlas cluster `tina-cms` (host `tina-cms.gxznqty.mongodb.net`,
  project id `6a18f54236dce0b2d91b996f`).
- **Dedicated local ports:** Tina server **4002**, datalayer **9001** (baked into package.json scripts) —
  so olivera_mag's Tina never conflicts with elemental's (which uses defaults 4001/9000). Multiple
  `tinacms dev` instances CAN run concurrently on this box thanks to this.
- **Vercel env (Production), all set except MONGODB_URI:** `TINA_PUBLIC_CLERK_PUBLIC_KEY`, `CLERK_SECRET`,
  `TINA_PUBLIC_ALLOWED_EMAILS`, `GITHUB_PERSONAL_ACCESS_TOKEN` (= `gh auth token`), `GITHUB_OWNER/REPO/BRANCH`.
  Stored as plain encrypted (NOT write-only "Sensitive") so `vercel env pull --environment=production` works.

### ⚠️ Pending: MONGODB_URI (the only missing piece)

Without it, `/admin` deploys but edits don't persist (local-DB fallback). To finish:

1. Re-auth Atlas (needs Anibal's device code): `printf '\n\n' | atlas auth login --noBrowser`
   then enter the code at https://account.mongodb.com/account/connect
2. Mint the db user:
   `atlas dbusers create readWriteAnyDatabase --username olivera_mag --password "$(openssl rand -base64 24 | tr -d '/+=')" --projectId 6a18f54236dce0b2d91b996f`
   (record the password — Atlas can't show it again)
3. Set the URI (format: `mongodb+srv://olivera_mag:<password>@tina-cms.gxznqty.mongodb.net/?retryWrites=true&w=majority`):
   `printf '%s' "<uri>" | vercel env add MONGODB_URI production --scope anibals-projects-c9882c4c`
   Also add it to local `.env`.
4. Redeploy: `git commit --allow-empty -m "Redeploy with MongoDB" && git push`

## Editors / access

- Allowed editors (`TINA_PUBLIC_ALLOWED_EMAILS`): `rolivera@olivera.com.uy`, `admin@olivera.com.uy`, `anibalin@gmail.com`
- Auth = shared Clerk dev app `app_3ENa7rioipLIOsJsiGl1iaPm0Qj` (same as siblings).
  Secret key lives in `/mnt/data/sites-sync/2026/migrate_claude_code/clerk.env` on this box.

## Secrets — where to find them on this box

- **Clerk secret (sk_test):** `/mnt/data/sites-sync/2026/migrate_claude_code/clerk.env`
- **GitHub token:** `gh auth token` (repo scope, account anibalinbalin)
- **Mongo:** NOT recoverable anywhere — must mint a new Atlas db user (see Pending above)
- Local `.env` (gitignored) mirrors the Vercel production env for local prod-mode testing

## Gotchas (hard-won)

- **Run `bunx tsc --noEmit` before every push** — `next build` type-checks (fails the deploy); `next dev` does not.
- **Never run `next build` while `next dev` runs on the same `.next`** — corrupts the dev cache.
  Kill dev, `rm -rf .next`, build, restart dev.
- **bun only** — keep a single `bun.lock`.
- **Tina collection `defaultItem` goes at the collection top level**, not inside `ui`.
- **Pinned deps (DON'T bump):** `tinacms@3.8.3`, `tinacms-clerk@22.0.3`, `@clerk/clerk-js@4.73.14`,
  `@clerk/backend@0.38.15`, `@tinacms/datalayer@2.0.22`, `tinacms-gitprovider-github@4.1.9`,
  `mongodb-level@0.0.4`, `@tinacms/cli@2.4.1` (dev). tinacms-clerk@22 requires Clerk v4 SDKs.
- **atlas CLI sessions expire** — `atlas auth whoami` can lie; test with
  `atlas dbusers list --projectId 6a18f54236dce0b2d91b996f`.
- **Keep post frontmatter flat**; filename === slug === URL.
- **Dates:** Tina writes ISO datetimes; `lib/blog.ts normalizeDate()` normalizes both ISO and
  plain `YYYY-MM-DD` to `YYYY-MM-DD`. Don't remove it.
- **tina-lock.json is committed** (generated by `tinacms dev`); `tina/__generated__/` and
  `public/admin/{index.html,assets}` are gitignored (regenerated on every build).

## Sister sites (live references)

- elemental → https://elemental-beryl.vercel.app/admin (editor: Laura) — app in subdir `landing_wip`
- diagnostico → https://diaglanding.vercel.app/admin (editor: jgualco) — app at repo root
- Origin playbook: `/mnt/data/sites-sync/2026/tina-nextjs-starter`

## Next steps (queue)

1. **MONGODB_URI** (see Pending above) — the only blocker for full production editing
2. Real images: issue covers, author photos, article covers (cream placeholders now)
3. Clerk auth for "Iniciar sesión" / "Suscribirme" buttons (non-functional)
4. About page (editorial letter formula from the every.to spec)
