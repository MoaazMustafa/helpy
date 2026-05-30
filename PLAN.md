# Helpy — Implementation Plan

> Source of truth for feature roadmap. Update checkboxes as work lands.
> Stack baseline: Expo SDK 56, expo-router, React Native 0.85, React 19, Uniwind + Tailwind v4, HeroUI Native v1, TypeScript.
> Read https://docs.expo.dev/versions/v56.0.0/ before adding any Expo API (per [AGENTS.md](AGENTS.md)).

---

## Status Legend

- [x] Done
- [~] In progress
- [ ] Pending

---

## Phase 0 — Foundations (already in place)

- [x] Expo Router app shell with native tabs ([src/app/\_layout.tsx](src/app/_layout.tsx), [src/components/app-tabs.tsx](src/components/app-tabs.tsx))
- [x] Uniwind + Tailwind v4 + global stylesheet ([src/global.css](src/global.css))
- [x] HeroUI Native installation + provider wiring ([src/app/\_layout.tsx](src/app/_layout.tsx))
- [x] Theme constants & color scheme hooks ([src/constants/theme.ts](src/constants/theme.ts), [src/hooks/use-color-scheme.ts](src/hooks/use-color-scheme.ts))
- [x] Animated splash overlay ([src/components/animated-icon.tsx](src/components/animated-icon.tsx))

---

## Phase 1 — App Architecture & Conventions

**Goal:** lock in folders, state, navigation, and tooling before features land.

- [x] Define feature-first folder layout under `src/features/<feature>/{components,hooks,services,types}` ([src/features/README.md](src/features/README.md))
- [x] Add path aliases for `@/features/*`, `@/db/*`, `@/lib/*` in [tsconfig.json](tsconfig.json)
- [x] Introduce a typed env loader using `expo-constants` `extra` ([src/lib/env.ts](src/lib/env.ts), [.env.example](.env.example))
- [x] Migrate `app.json` → `app.config.ts` ([app.config.ts](app.config.ts))
- [x] Add ESLint + Prettier baseline ([eslint.config.js](eslint.config.js), [prettier.config.js](prettier.config.js), `npm run lint` / `lint:fix` / `format` / `format:check` / `typecheck` / `check`)
- [x] Single `npm run check` script in place (Husky/lint-staged deferred — optional)
- [x] State management chosen and wired:
  - Server cache: **TanStack Query** ([src/lib/query-client.ts](src/lib/query-client.ts))
  - Client/UI state: **Zustand**
  - Persistent settings: **AsyncStorage** via `@react-native-async-storage/async-storage` ([src/lib/storage.ts](src/lib/storage.ts)) — Expo Go compatible; can swap for MMKV later in a dev build for perf
- [x] Add error boundary at root + dev-only logger ([src/components/error-boundary.tsx](src/components/error-boundary.tsx), [src/lib/logger.ts](src/lib/logger.ts))

**Best practices**

- One barrel per feature, no cross-feature deep imports.
- All async services return discriminated `Result<T, E>` (no thrown strings).
- Co-locate Zod schemas with the entity they describe.

---

## Phase 2 — Theme Switching (must-have)

**Goal:** user-controlled light / dark / system theme persisted locally and synced to HeroUI.

- [x] Add `useThemePreference` Zustand store backed by MMKV ([src/features/theme/store.ts](src/features/theme/store.ts))
- [x] Resolve effective scheme via `useColorScheme()` + preference, expose `useTheme()` / `useResolvedScheme()` ([src/hooks/use-theme.ts](src/hooks/use-theme.ts))
- [x] Wire resolved scheme into `ThemeProvider` and native tab bar ([src/app/\_layout.tsx](src/app/_layout.tsx), [src/components/app-tabs.tsx](src/components/app-tabs.tsx))
- [x] Settings screen toggle (segmented control: System / Light / Dark) ([src/app/settings.tsx](src/app/settings.tsx), [src/features/theme/components/theme-toggle.tsx](src/features/theme/components/theme-toggle.tsx))
- [x] `expo-status-bar` style reacts to scheme ([src/app/\_layout.tsx](src/app/_layout.tsx))
- [ ] Persist preference to remote `user_settings` (Phase 6) once auth is ready

**Best practices**

- Never read color values inline; always go through `Colors[scheme]` in [src/constants/theme.ts](src/constants/theme.ts) or Tailwind tokens.
- Avoid re-renders by selecting slices from Zustand (`useThemePreference(s => s.mode)`).

---

## Phase 3 — Local Database (SQLite) & Offline-First Layer

**Goal:** All primary data (tasks, reminders, expenses, progress) lives in SQLite. Online DB is a sync target only.

- [ ] Install `expo-sqlite` (SDK 56 API — confirm against versioned docs)
- [ ] Choose ORM/query layer: **Drizzle ORM** with `drizzle-orm/expo-sqlite` (typed, migrations, no native build)
- [ ] Define schema modules per feature under `src/db/schema/*.ts`
  - `tasks`, `reminders`, `alarms`, `progress_entries`, `expenses`, `wallets`, `categories`, `user_settings`
- [ ] Set up Drizzle migrations + a `useMigrations()` hook gated on app boot
- [ ] Create `src/db/client.ts` that opens DB once, exposes typed `db`
- [ ] Create repository layer (`src/features/<feature>/services/*.repo.ts`) — no direct DB access from components
- [ ] Add sync metadata columns (`updated_at`, `synced_at`, `deleted_at`, `dirty`) on every syncable table
- [ ] Outbox pattern for offline writes (`sync_outbox` table)

**Best practices**

- All writes go through a transaction helper.
- Soft delete (`deleted_at`) — never hard delete syncable rows.
- ULIDs for primary keys (sortable, sync-friendly).

---

## Phase 4 — Auth: Google & GitHub Sign-In (must-have)

**Goal:** OAuth via `expo-auth-session` with PKCE; session persisted in `expo-secure-store`.

- [ ] Install `expo-auth-session`, `expo-secure-store`, `expo-crypto`, `expo-web-browser`
- [ ] Add Google OAuth client (iOS / Android / Web) — store IDs in env, not in repo
- [ ] Add GitHub OAuth app (note: GitHub requires a backend for `client_secret`; plan a small Cloudflare Worker / Supabase edge function as token exchange proxy)
- [ ] Implement `useAuth()` with states: `loading | signedOut | signedIn(user)`
- [ ] Store tokens in SecureStore; never in MMKV or AsyncStorage
- [ ] Add sign-in screen + sign-out action in Settings
- [ ] Add auth guard wrapper in expo-router (`(auth)` and `(app)` route groups)
- [ ] Send id_token to backend (Phase 6) to mint app session / Supabase JWT

**Best practices**

- PKCE everywhere; no implicit flow.
- Refresh tokens stored only in SecureStore; auto-refresh on 401.
- Treat the user object as immutable; mutate via server round-trip.

---

## Phase 5 — App Lock (Native, Face ID / Touch ID / Device Passcode) (must-have)

**Goal:** Apple-style auto-lock with biometric unlock fallback to device passcode.

- [ ] Install `expo-local-authentication`
- [ ] Add `useAppLock()` store: `locked | unlocked`, timestamps, `lockAfterSeconds`
- [ ] Lock on `AppState` change to `background`/`inactive` after configurable timeout (Immediately / 1m / 5m / 15m / Never)
- [ ] Full-screen `LockScreen` modal rendered at root, blocks all routes when `locked`
- [ ] Trigger `LocalAuthentication.authenticateAsync({ disableDeviceFallback: false, requireConfirmation: false })` on mount
- [ ] Settings: enable/disable app lock, choose timeout, require auth for expenses module separately
- [ ] Privacy screen: render a blur/cover when app moves to background (iOS `expo-blur` overlay)
- [ ] Store "lock enabled" flag in SecureStore (so the flag itself isn't tampered with)

**Best practices**

- Never persist biometric data; rely entirely on OS.
- Don't unlock automatically on cold start unless the user opts in.
- Clear in-memory secrets when locked.

---

## Phase 6 — Online DB & Sync (must-have)

**Goal:** Cloud-backed user settings + selected data. Local SQLite remains primary.

- [ ] Choose backend: **Supabase** (Postgres + Auth + Row Level Security) — fastest path; alternative: Cloudflare D1 + Workers
- [ ] Schema mirrors local syncable tables; add `user_id` FK, RLS policies per user
- [ ] Implement bidirectional sync engine:
  - Push: drain `sync_outbox` on connectivity
  - Pull: `since=updated_at` cursor per table
  - Conflict resolution: last-write-wins on scalar fields, server wins on conflicts flagged by version column
- [ ] Use `@react-native-community/netinfo` to gate sync
- [ ] Background sync via `expo-background-task` (SDK 56) for periodic pull
- [ ] Surface sync status in UI (idle / syncing / error / offline)
- [ ] Encrypt sensitive columns client-side before upload (expenses notes, etc.) — optional v2

**Best practices**

- All server calls validated with Zod before insertion into local DB.
- Never trust client clock for `updated_at`; server stamps on write.
- Idempotent mutations keyed by client-generated ULID.

---

## Phase 7 — Tasks, Reminders & Alarms (must-have + feature)

**Goal:** Tasks with start/end times double as progress entries; reminders & alarms fire via local notifications.

- [ ] Install `expo-notifications` and configure channels (Android) + categories (iOS actions: Complete, Snooze)
- [ ] Request notification permissions on first task creation, not on launch
- [ ] Task schema: `id, title, notes, start_at, end_at, status, category_id, priority, recurrence_rule (RFC 5545 subset)`
- [ ] Reminder schema: `task_id?, fire_at, repeat_rule, sound, notification_id`
- [ ] Alarm flow: full-screen notification on Android (`AndroidNotificationPriority.MAX` + `interruptionLevel: 'timeSensitive'` on iOS)
- [ ] Recurring alarms: schedule next occurrence on dismiss/complete (Expo notifications don't natively support all RRULEs)
- [ ] Task list UI (HeroUI components): grouped by Today / Upcoming / Overdue
- [ ] Quick-add sheet (HeroUI `BottomSheet`) — requires `@gorhom/bottom-sheet` install
- [ ] Snooze action handlers via `Notifications.addNotificationResponseReceivedListener`

**Best practices**

- Always cancel old notification IDs when editing a reminder.
- Store `notification_id` returned by Expo so we can cancel deterministically.
- Use `expo-task-manager` only if true background work is needed; otherwise keep logic in foreground.

---

## Phase 8 — Daily Progress Tracking (feature)

**Goal:** Progress = completion rate of time-boxed tasks per day.

- [ ] Derive progress from tasks: `completed_on_time / scheduled` per day
- [ ] Materialize daily roll-ups into `progress_entries` (date, scheduled, completed, on_time, score)
- [ ] Recompute roll-up on task status change (DB trigger via SQL or app-level handler)
- [ ] Home screen widgets:
  - Today's ring (HeroUI progress)
  - 7-day trend chart (use `victory-native` v40 or `react-native-svg-charts`)
  - Streak counter
- [ ] Weekly / monthly summary screen
- [ ] Export progress as CSV (share sheet via `expo-sharing`)

**Best practices**

- Roll-ups are derived; never the source of truth.
- All date math through a single helper (DST + timezone safe — use `date-fns-tz`).

---

## Phase 9 — Expenses & Pocket Money (feature)

**Goal:** Lightweight personal finance module, fully offline-capable.

- [ ] Schema: `wallets`, `categories`, `transactions (id, wallet_id, category_id, amount_cents, currency, type: income|expense|transfer, occurred_at, note)`
- [ ] Money stored as integer cents; never floats
- [ ] Multi-currency support (default from device locale)
- [ ] Monthly budget per category with progress bars
- [ ] Quick-add transaction sheet
- [ ] Charts: spend-by-category donut, monthly trend
- [ ] Optional biometric gate for opening the module (ties into Phase 5)
- [ ] CSV import/export

**Best practices**

- Validate amounts with Zod refinement (`> 0`, integer).
- Display formatting via `Intl.NumberFormat`, never custom regex.

---

## Phase 10 — Offline-First Hardening (must-have)

**Goal:** Every screen works with zero network.

- [ ] Audit each feature: no UI states blocked on network
- [ ] Cache HeroUI assets / fonts via `expo-font` preload
- [ ] Connectivity banner (subtle, dismissible)
- [ ] Sync conflict UI (rare-case modal)
- [ ] Retry/backoff for outbox drain (exponential, capped)
- [ ] E2E test offline scenarios (Detox or Maestro)

---

## Phase 11 — Settings Screen Aggregation

- [ ] Sections: Account, Appearance (theme), Security (app lock), Notifications, Data & Sync, About
- [ ] "Erase local data" with double confirm + biometric
- [ ] Sign-out clears MMKV + SQLite caches but preserves device-bound prefs

---

## Phase 12 — Quality, CI, Release

- [ ] GitHub Actions: typecheck, lint, unit tests on PR
- [ ] EAS Build profiles: development, preview, production
- [ ] EAS Update channel strategy
- [ ] Crash + analytics: Sentry (`sentry-expo` SDK 56 compatible build)
- [ ] App Store / Play Store metadata, privacy manifest (iOS), data safety form (Android)

---

## Cross-Cutting Concerns

- **Security**: All secrets in SecureStore; PKCE OAuth; RLS on Supabase; no PII in logs.
- **Accessibility**: Min 44pt tap targets; `accessibilityLabel` on every interactive element; dynamic type support.
- **Performance**: `react-native-reanimated` worklets for animations; `FlashList` for long lists.
- **i18n**: Defer until v1.1, but isolate strings now via a `t()` shim.

---

## Open Decisions (need user input before starting)

1. Backend choice: **Supabase** vs **Cloudflare D1 + Workers** vs **Firebase**?
2. Charts library preference (`victory-native` vs `react-native-svg-charts` vs custom Skia)?
3. GitHub OAuth proxy: deploy ourselves, or skip GitHub and stick to Google for v1?
4. Should expenses module be gated behind a separate PIN/biometric independent of app lock?
