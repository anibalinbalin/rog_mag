import { createMediaHandler } from 'next-tinacms-cloudinary/dist/handlers';
import { Clerk } from '@clerk/backend';
import type { NextApiRequest } from 'next';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

// Same allowlist as pages/api/tina/[...routes].ts — only these editors may
// upload, list, or delete media. Locally, auth is disabled entirely.
const allowList = (process.env.TINA_PUBLIC_ALLOWED_EMAILS || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET as string });

/** Mirrors ClerkBackendAuthentication (tinacms-clerk): the admin's media store
    sends the Clerk session token via fetchWithToken; verify it and check the
    signed-in user's primary email against the allowlist. */
async function isAuthorized(req: NextApiRequest): Promise<boolean> {
  if (isLocal) return true;
  try {
    const token = req.headers['authorization'];
    const headerToken =
      typeof token === 'string' ? token.replace('Bearer ', '').trim() : undefined;
    const requestState = await clerk.authenticateRequest({ headerToken });
    if (requestState.status !== 'signed-in') return false;

    const user = await clerk.users.getUser(requestState.toAuth().userId);
    const primaryEmail = user.emailAddresses.find(
      ({ id }) => id === user.primaryEmailAddressId
    );
    return !!primaryEmail && allowList.includes(primaryEmail.emailAddress);
  } catch (error) {
    console.error('cloudinary media auth error', error);
    return false;
  }
}

// Disables Next's bodyParser so multer can handle the multipart upload.
// NOTE: must be an inline literal — Next.js statically analyzes this export
// and rejects imported identifiers (build error: "Unknown identifier").
// Same value as mediaHandlerConfig from next-tinacms-cloudinary.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default createMediaHandler({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  authorized: async (req, _res) => isAuthorized(req),
});
