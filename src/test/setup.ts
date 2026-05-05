import { vi } from "vitest";

// Stub next/cache so unit tests don't need Next.js's incremental cache or
// server-action context to pass. unstable_cache becomes a passthrough that
// just calls the wrapped function; updateTag/revalidateTag are no-ops.
vi.mock("next/cache", () => ({
  unstable_cache: <Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) => fn,
  updateTag: () => {},
  revalidateTag: () => {},
  revalidatePath: () => {},
}));
