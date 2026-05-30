/**
 * Discriminated `Result<T, E>` type used by service-layer functions.
 *
 * Services should never throw for expected errors. They return either
 * `{ ok: true, value }` or `{ ok: false, error }`. Unexpected errors
 * (programmer bugs) may still throw.
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * Wraps a promise so rejections become `err(...)` results.
 */
export async function safe<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    return ok(await promise);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
