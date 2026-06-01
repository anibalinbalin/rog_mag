# olivera_mag — Olivera magazine site (TO BUILD)

This folder is the **Olivera magazine** site — the 3rd of three sister sites that all use the
same **self-hosted TinaCMS** blog setup. As of 2026-05-29 this folder is **empty / greenfield**:
the Next.js app + blog still need to be built. **Tina comes AFTER** the site has a blog with a
content reader — don't wire Tina into an empty app.

## The plan for this project

1. **Build the site first** — Next.js (App Router) + Tailwind, a blog that reads markdown posts
   (e.g. `content/blog/*.md` via `gray-matter`), magazine landing/article pages.
2. **Then add the self-hosted TinaCMS editor** (`/admin`) so the editors can author posts in a GUI,
   following the exact playbook the two sibling sites already use (copy from them — see below).

## Repo

- **GitHub:** `anibalinbalin/rog_mag` (https://github.com/anibalinbalin/rog_mag.git)
- **Local dir:** `/mnt/data/sites-sync/2026/olivera_mag/`
- App at repo root (no subdir layout).

## Editors / access (already decided)

- Allowed editors (`TINA_PUBLIC_ALLOWED_EMAILS`): `rolivera@olivera.com.uy`,
  `admin@olivera.com.uy`, `anibalin@gmail.com`.
- Auth = the SAME shared Clerk dev app as the siblings: `app_3ENa7rioipLIOsJsiGl1iaPm0Qj`
  (publishable key `pk_test_YWNjdXJhdGUtZ2FyZmlzaC0zMC5jbGVyay5hY2NvdW50cy5kZXYk`; the secret key
  is in the siblings' Vercel env — reuse it / ask Anibal to repaste).

## Tina playbook (copy from the working siblings)

Two live, working references on this machine — copy `tina/` + `pages/api/tina/` from whichever
matches this project's layout:
- **App at repo root:** `/mnt/data/sites-sync/2026/stackmd/buena/codex_diag` (the `diaglanding`
  project) — has its own `CLAUDE.md` documenting the whole setup. Use this if olivera_mag's Next
  app is at the repo root (no `GitHubProvider rootPath`).
- **App in a subdir:** `/mnt/data/sites-sync/2026/elemental/landing_wip` — uses
  `GitHubProvider({ rootPath: '<subdir>' })` so commits land in the subdir Vercel builds from.
- Origin of the playbook: the `tina-nextjs-starter` repo.

What to set up when adding Tina here:
- `tina/config.tsx` (Clerk auth + LocalAuthProvider for dev, admin SPA → `public/admin`),
  `tina/database.ts` (Mongo datalayer + GitHub git provider), `tina/collection/post.ts`
  (schema matching this site's frontmatter), `pages/api/tina/[...routes].ts` (TinaNodeBackend
  + ClerkBackendAuthentication).
- **dbName: `olivera_mag`** (unique) on the SHARED Atlas cluster `tina-cms`
  (host `tina-cms.gxznqty.mongodb.net`, Atlas project id `6a18f54236dce0b2d91b996f`). Mint a new
  Atlas db user for it (don't reuse another project's — passwords aren't recoverable).
- Vercel env (Production): `MONGODB_URI`, `TINA_PUBLIC_CLERK_PUBLIC_KEY`, `CLERK_SECRET`,
  `TINA_PUBLIC_ALLOWED_EMAILS`, `GITHUB_PERSONAL_ACCESS_TOKEN` + `GITHUB_OWNER/REPO/BRANCH`.
- Pinned deps (DON'T bump): `tinacms@3.8.3`, `tinacms-clerk@22.0.3`, `@clerk/clerk-js@4`,
  `@clerk/backend@0.38`, `@tinacms/datalayer@2.0.22`, `tinacms-gitprovider-github`, `mongodb-level`,
  `@tinacms/cli@2.4.1` (dev).
- Scripts: dev = `TINA_PUBLIC_IS_LOCAL=true tinacms dev -c "next dev -p <port>"`;
  build = `tinacms build --partial-reindex && next build`.

## Gotchas (learned building the siblings)

- **Run `bunx tsc --noEmit` before every push** — `next build` type-checks (fails the deploy);
  `next dev` does not, so type errors slip through locally.
- **bun only** — keep a single `bun.lock`; don't let `package-lock.json`/`pnpm-lock.yaml` coexist
  (Vercel may pick the wrong installer and miss the Tina deps).
- **Tina collection `defaultItem` goes at the collection top level**, not inside `ui`.
- **Only one `tinacms dev` at a time** per machine (fixed datalayer port 9000).
- **atlas CLI sessions expire** — re-auth with `printf '\n\n' | atlas auth login --noBrowser`
  (the newline picks the default UserAccount), then enter the device code at
  https://account.mongodb.com/account/connect. `atlas auth whoami` can lie ("logged in") while
  real calls fail — test with `atlas dbusers list --projectId 6a18f54236dce0b2d91b996f`.
- Keep post frontmatter fields **flat** (the frontend reads them via gray-matter); if the URL is
  the filename, make the filename equal the `slug`.

## Sister sites (live)

- elemental → https://elemental-beryl.vercel.app/admin (editor: Laura)
- diagnostico → https://diaglanding.vercel.app/admin (editor: jgualco)
