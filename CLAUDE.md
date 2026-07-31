# olivera_mag — Olivera magazine site

**Revista de Derecho Comercial y de la Empresa** — the 3rd of three sister sites using the same
self-hosted TinaCMS setup. The site is **built and live**; Tina is **wired** (one env var pending,
see below).

- **Production:** https://revistaderechocomercial.edu.uy (every.to-style layout, sections/authors/issues;
  DNS on Porkbun, www 308→apex; rog-mag.vercel.app still works as alias)
- **Admin:** https://revistaderechocomercial.edu.uy/admin (Clerk Google login, allowed emails only)
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
  **CRITICAL:** `createLocalDatabase({ port: 9001 })` in `tina/database.ts` MUST match the
  `--datalayer-port` flag — it's a TCP client connecting to the CLI's datalayer server. A mismatch
  (client default 9000, server on 9001) hangs builds forever. This hung a Vercel build for 46 min;
  it "worked" locally only because elemental's dev server happened to be listening on 9000.
- **Vercel env (Production):** `TINA_PUBLIC_CLERK_PUBLIC_KEY`, `CLERK_SECRET`,
  `TINA_PUBLIC_ALLOWED_EMAILS`, `GITHUB_PERSONAL_ACCESS_TOKEN` (= `gh auth token`), `GITHUB_OWNER/REPO/BRANCH`,
  `MONGODB_URI`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
  Stored as plain encrypted (NOT write-only "Sensitive") so `vercel env pull --environment=production` works.

### ✅ MONGODB_URI — DONE (2026-06-02)

Atlas db user `olivera_mag` minted; `MONGODB_URI` set in Vercel Production AND in local `.env`
(password is recoverable from `.env` — don't delete it). Content indexed into the `olivera_mag`
database (collection `tinacms-main`) on the shared `tina-cms` cluster. Production editing is live.

## Media (Cloudinary) — wired 2026-06-02

- **Cloud:** `dz9zexfaf` (free plan, account owner = Anibal). Credentials in local `.env`
  (`CLOUDINARY_URL` works with the `cld` CLI: `CLOUDINARY_URL=... cld admin usage`).
- **Package:** `next-tinacms-cloudinary@25.0.3` — PINNED; its peer dep is exactly `tinacms@3.8.3`.
  Each next-tinacms-cloudinary version pins one exact tinacms version — when (ever) bumping tinacms,
  bump this in lockstep (25.0.4 ↔ 3.8.4, etc.).
- **Upload backend:** `pages/api/cloudinary/[...media].ts` — `createMediaHandler` with a Clerk
  auth callback (same allowlist as the Tina GraphQL route). Local dev (`TINA_PUBLIC_IS_LOCAL=true`)
  skips auth.
- **Media store:** `tina/config.tsx` → `media.loadCustomStore` → `TinaCloudCloudinaryMediaStore`
  (sends the Clerk token via the authProvider's fetchWithToken).
- **Image fields (all optional):** `post.coverImage`, `author.photo`, `issue.cover`. Rendered with
  `next/image` (`fill` + `object-cover`), cream placeholder is the fallback when unset.
- **next.config.ts:** `images.remotePatterns` allows `res.cloudinary.com/dz9zexfaf/**`.

## Editors / access

- Allowed editors (`TINA_PUBLIC_ALLOWED_EMAILS`): `rolivera@olivera.com.uy`, `admin@olivera.com.uy`,
  `rddcydle@gmail.com` (dedicated site account — "Revista de Derecho Comercial Y De La Empresa";
  replaced Anibal's personal anibalin@gmail.com on 2026-06-02)
- Auth = shared Clerk dev app `app_3ENa7rioipLIOsJsiGl1iaPm0Qj` (same as siblings).
  Secret key lives in `/mnt/data/sites-sync/2026/migrate_claude_code/clerk.env` on this box.

## Secrets — where to find them on this box

- **Clerk secret (sk_test):** `/mnt/data/sites-sync/2026/migrate_claude_code/clerk.env`
- **GitHub token:** `gh auth token` (repo scope, account anibalinbalin)
- **Mongo:** the Atlas user password is ONLY in local `.env` (and Vercel) — don't delete it
- **Cloudinary:** API key/secret/cloud-name in local `.env` (and Vercel); also recoverable from
  console.cloudinary.com (Anibal's account)
- Local `.env` (gitignored) mirrors the Vercel production env for local prod-mode testing

## Gotchas (hard-won)

- **Run `bunx tsc --noEmit` before every push** — `next build` type-checks (fails the deploy); `next dev` does not.
- **Never run `next build` while `next dev` runs on the same `.next`** — corrupts the dev cache.
  Kill dev, `rm -rf .next`, build, restart dev.
- **bun only** — keep a single `bun.lock`.
- **Tina collection `defaultItem` goes at the collection top level**, not inside `ui`.
- **Pinned deps (DON'T bump):** `tinacms@3.8.3`, `tinacms-clerk@22.0.3`, `@clerk/clerk-js@4.73.14`,
  `@clerk/backend@0.38.15`, `@tinacms/datalayer@2.0.22`, `tinacms-gitprovider-github@4.1.9`,
  `mongodb-level@0.0.4`, `next-tinacms-cloudinary@25.0.3`, `@tinacms/cli@2.4.1` (dev).
  tinacms-clerk@22 requires Clerk v4 SDKs.
- **Next.js pages-API `config` export must be an inline object literal** — `export const config =
  mediaHandlerConfig` (imported identifier) fails `next build` with "Unknown identifier". Inline
  `{ api: { bodyParser: false } }` instead.
- **`tinacms build --partial-reindex` is git-commit-based**: it diffs Mongo's stored `lastSha`
  against HEAD to decide what to reindex. Schema changes that are UNCOMMITTED are invisible to it →
  local `bun run build` prerender fails with "Cannot query field X" against the stale Mongo schema.
  COMMIT FIRST (tina-lock.json in the diff triggers the full reindex), then build, then push.
- **atlas CLI sessions expire** — `atlas auth whoami` can lie; test with
  `atlas dbusers list --projectId 6a18f54236dce0b2d91b996f`.
- **Keep post frontmatter flat**; filename === slug === URL.
- **Dates:** Tina writes ISO datetimes; `lib/blog.ts normalizeDate()` normalizes both ISO and
  plain `YYYY-MM-DD` to `YYYY-MM-DD`. Don't remove it.
- **tina-lock.json is committed** (generated by `tinacms dev`); `tina/__generated__/` and
  `public/admin/{index.html,assets}` are gitignored (regenerated on every build).
- **The dev-mode /admin only works in a browser ON the dev box** — its stub loads assets from
  `http://localhost:4002/...` (hardcoded by the Tina CLI), which is unreachable from Anibal's
  MacBook over Tailscale ("Failed loading TinaCMS assets"). For remote testing of the editor,
  ALWAYS use the production admin (rog-mag.vercel.app/admin). The local :3003 site pages are fine.
- **Admin collection search is production-only** — `tina/config.tsx` wires a custom `searchClient`
  (queries our GraphQL backend, text-matches in the browser, no index). In dev mode Tina ignores it
  and queries a hardcoded `localhost:4001` (our CLI runs on 4002), so dev-mode admin search never
  works. The pinned tinacms types the searchClient slot as `undefined` → it's cast `as never`.

## Sister sites (live references)

- elemental → https://elemental-beryl.vercel.app/admin (editor: Laura) — app in subdir `landing_wip`
- diagnostico → https://diaglanding.vercel.app/admin (editor: jgualco) — app at repo root
- Origin playbook: `/mnt/data/sites-sync/2026/tina-nextjs-starter`

## Next steps (queue)

1. Clerk auth for "Iniciar sesión" / "Suscribirme" buttons (non-functional)
2. Carta editorial copy on /nosotros needs Rolivera's review (placeholder institutional text)

Done: MONGODB_URI (2026-06-02), editor image uploads via Cloudinary + real image rendering (2026-06-02),
Nano Banana cover art for all 13 content items + /nosotros about page (2026-06-02), admin collection
search via custom searchClient (2026-06-02), Cloudinary demo folders cleaned out (2026-06-02).

## Worktree Sessions (`claude -w`)

If this session runs in a worktree (`.claude/worktrees/<name>/`):

1. `bun install` first — node_modules is not copied. Gitignored env files arrive via `.worktreeinclude`.
2. Dev server: pick a free port in 3005-3008 — all pre-mapped via `tailscale serve`, so the access URL is `https://claude-code-sec.tailf626.ts.net:<port>/` — never hand over localhost or the LAN IP.
3. Finish with `/go` (commit → push → PR → merge, `anibal/` branch prefix). Never hand uncommitted files back to the main checkout — the hub tab only ever `git pull`s after merge.
