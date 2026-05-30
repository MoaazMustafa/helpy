# Feature modules

Each feature owns its own slice: `components/`, `hooks/`, `services/`, `types/`, plus a top-level `index.ts` barrel.

**Rules**

- Other features import only through the barrel (`@/features/<name>`).
- No cross-feature deep imports.
- Services return `Result<T, E>` (see [src/lib/result.ts](../lib/result.ts)) instead of throwing.
- Zod schemas co-located with the entity they describe.
