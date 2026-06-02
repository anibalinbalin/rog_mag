import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer';
import { ClerkBackendAuthentication } from 'tinacms-clerk';

import databaseClient from '../../../tina/__generated__/databaseClient';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

// Comma-separated list of emails allowed into /admin (matched against the
// signed-in Clerk user's primary email). Locally, auth is disabled entirely.
const allowList = (process.env.TINA_PUBLIC_ALLOWED_EMAILS || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : ClerkBackendAuthentication({
        secretKey: process.env.CLERK_SECRET as string,
        allowList,
      }),
  databaseClient,
});

export default (req: any, res: any) => {
  return handler(req, res);
};
