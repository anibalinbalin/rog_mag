import { createDatabase, createLocalDatabase } from '@tinacms/datalayer';
import { MongodbLevel } from 'mongodb-level';
import { GitHubProvider } from 'tinacms-gitprovider-github';

// Toggled by the package.json scripts. MUST be false/unset in production.
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

// The shared Atlas data layer's MONGODB_URI is only scoped to the Production
// Vercel environment, so Preview/Development builds have no connection string —
// without this guard their `tinacms build --partial-reindex` step crashes with
// "Database is not open" and takes the whole deploy down. Fall back to the
// filesystem-backed local database whenever the URI is absent. This is safe:
// the public site reads content straight from content/*.md (see lib/blog.ts)
// and never queries this DB, so deploys still build and render identically;
// only the /admin editing backend (pages/api/tina) depends on the data layer.
const hasMongo = Boolean(process.env.MONGODB_URI);

const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string;
const owner = (process.env.GITHUB_OWNER ||
  process.env.VERCEL_GIT_REPO_OWNER) as string;
const repo = (process.env.GITHUB_REPO ||
  process.env.VERCEL_GIT_REPO_SLUG) as string;
const branch = (process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  'main') as string;

// Shared "tina-cms" Atlas cluster hosts every project — unique dbName per
// project so indexes never collide. (Siblings use "elemental" / "diagnostico".)
const dbName = 'olivera_mag';

// MUST match the --datalayer-port flag in the package.json dev/build scripts.
// createLocalDatabase connects to the CLI's datalayer server as a TCP client;
// a mismatch (client on 9000, server on 9001) hangs indexing forever.
const DATALAYER_PORT = 9001;

export default isLocal || !hasMongo
  ? createLocalDatabase({ port: DATALAYER_PORT })
  : createDatabase({
      // App is at the repo root (Vercel root dir "."), so content commits to
      // content/blog etc. directly — no rootPath needed.
      gitProvider: new GitHubProvider({ branch, owner, repo, token }),
      databaseAdapter: new MongodbLevel<string, Record<string, any>>({
        collectionName: `tinacms-${branch}`,
        dbName,
        mongoUri: process.env.MONGODB_URI as string,
      }),
      namespace: branch,
    });
