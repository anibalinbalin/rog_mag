import Clerk from '@clerk/clerk-js';
import { defineConfig, LocalAuthProvider } from 'tinacms';
import { ClerkAuthProvider } from 'tinacms-clerk/dist/tinacms';

import Post from './collection/post';
import Author from './collection/author';
import Issue from './collection/issue';

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

const config = defineConfig({
  // Self-hosted: talk to our own backend route instead of TinaCloud.
  contentApiUrlOverride: '/api/tina/gql',
  authProvider: isLocal
    ? new LocalAuthProvider()
    : new ClerkAuthProvider({ clerk: clerk as Clerk, allowedList }),
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH! ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF! ||
    process.env.HEAD!,
  media: {
    tina: {
      publicFolder: 'public',
      mediaRoot: 'uploads',
      static: true,
    },
  },
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
    basePath: '',
  },
  schema: {
    collections: [Post, Author, Issue],
  },
});

export default config;
