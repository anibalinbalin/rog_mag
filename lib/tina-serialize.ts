/**
 * The self-hosted Tina `databaseClient` resolves content straight from the
 * database, which yields null-prototype objects. React Server Components may
 * only hand *plain* objects to Client Components, so query results must be
 * round-tripped through JSON before being passed to any `"use client"`
 * component (e.g. `useTina`).
 *
 * @see https://github.com/vercel/next.js/issues/47447
 */
export function plainify<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
