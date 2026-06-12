import Clerk from '@clerk/clerk-js';
import { defineConfig, LocalAuthProvider } from 'tinacms';
import { ClerkAuthProvider } from 'tinacms-clerk/dist/tinacms';

import Post from './collection/post';
import Author from './collection/author';
import Issue from './collection/issue';
import Epoca from './collection/epoca';
import Pagina from './collection/pagina';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

const allowedList = (process.env.TINA_PUBLIC_ALLOWED_EMAILS || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);

// @clerk/clerk-js is a browser library — only instantiate it where a DOM
// exists (the admin SPA), never during Node-side schema codegen.
const clerk =
  !isLocal && typeof document !== 'undefined'
    ? new Clerk(process.env.TINA_PUBLIC_CLERK_PUBLIC_KEY as string)
    : undefined;

const authProvider = isLocal
  ? new LocalAuthProvider()
  : new ClerkAuthProvider({ clerk: clerk as Clerk, allowedList });

// --- Admin search (self-hosted) -------------------------------------------
// TinaCloud's hosted search index isn't available to self-hosted sites, so
// the admin's per-collection search queries our own GraphQL backend instead:
// fetch every document in the collection (the corpus is ~a dozen files),
// text-match in the browser, and return ids in the
// "<collection>:<relativePath>" shape the admin resolves back into documents.
// No index is maintained — results always reflect live content — so put/del
// are no-ops and supportsClientSideIndexing() is false (the admin must not
// try to keep an index in sync on save/rename/delete).
//
// Local-dev note: with TINA_PUBLIC_IS_LOCAL=true the admin ignores this
// client and queries the Tina CLI's own index at a hardcoded localhost:4001;
// our CLI runs on 4002, so dev-mode admin search stays non-functional.
// Production (rog-mag.vercel.app/admin) is what this client is for.

/** Lowercase + strip accents so "anonimas" matches "Sociedades Anónimas". */
const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const searchClient = {
  query: async (
    query: string,
    options?: { limit?: number; cursor?: string; collection?: string }
  ) => {
    const empty = { results: [], total: 0, nextCursor: null, prevCursor: null };
    if (!options?.collection) return empty;

    const res = await authProvider.fetchWithToken('/api/tina/gql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query SearchCollection($collection: String!) {
          collection(collection: $collection) {
            name
            documents(first: -1) {
              edges {
                node {
                  ... on Document {
                    _values
                    _sys {
                      relativePath
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: { collection: options.collection },
      }),
    });
    if (!res.ok) return empty;
    const { data } = await res.json();

    const collectionName: string = data?.collection?.name ?? options.collection;
    const edges: {
      node: { _values: unknown; _sys: { relativePath: string } };
    }[] = data?.collection?.documents?.edges ?? [];

    // Every search term must appear somewhere in the document's values.
    const terms = normalizeText(query).split(/\s+/).filter(Boolean);
    const matches = edges.filter(({ node }) => {
      const haystack = normalizeText(JSON.stringify(node._values ?? {}));
      return terms.every((term) => haystack.includes(term));
    });

    return {
      results: matches.slice(0, options.limit ?? 15).map(({ node }) => ({
        _id: `${collectionName}:${node._sys.relativePath}`,
        _match: {},
      })),
      total: matches.length,
      nextCursor: null,
      prevCursor: null,
    };
  },
  put: async () => {},
  del: async () => {},
  supportsClientSideIndexing: () => false,
  getDefaultLimit: () => 15,
};

const config = defineConfig({
  // Self-hosted: talk to our own backend route instead of TinaCloud.
  contentApiUrlOverride: '/api/tina/gql',
  authProvider,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH! ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF! ||
    process.env.HEAD!,
  media: {
    // Cloudinary media store: uploads/deletes go through our own
    // /api/cloudinary/[...media] route (Clerk-authenticated in prod).
    loadCustomStore: async () => {
      const pack = await import('next-tinacms-cloudinary');
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },
  search: {
    // The pinned tinacms@3.8.3 types defineConfig's searchClient slot as
    // `undefined` (its SearchClient generic is never threaded through), so
    // the real client has to be cast past it. The admin SPA reads it untyped
    // at runtime; the CLI build skips it via --skip-search-index.
    searchClient: searchClient as never,
  },
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
    basePath: '',
  },
  schema: {
    collections: [Post, Author, Issue, Epoca, Pagina],
  },
});

export default config;
