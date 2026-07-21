# deskline — agent notes

A support ticket queue built on the canonical Hanzo app stack: Vite + React 19 +
`@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data). Forked from
`hanzo-apps/hanzo-starter`; the provider stack, `vite.config.ts`, auth flow, and
deploy contract are identical to it. Keep it minimal and REAL — every surface
must build and run, no fabricated UI.

## What it is

Three views over two org-scoped Base collections (`tickets`, `replies`):

- **Ticket queue** (`views/queue.tsx`) — status filter chips + a list ordered
  live-first (open/pending) then by severity then newest. Selecting a row opens
  it in the detail pane.
- **Ticket detail + replies** (`views/detail.tsx`) — the request, segmented
  triage of `status` and `priority` (`tickets.update`), the reply thread, and a
  composer (`replies.create`). First reply on an Open ticket → Pending.
- **New ticket** (`views/compose.tsx`) — subject/body/severity/requester →
  `tickets.create` (status `open`), then the shell selects the new row.

`views/home.tsx` is the signed-in shell: it owns the two `useQuery`s and the
split queue/detail layout; `lib/tickets.ts` holds the types + status/severity
metadata + ordering/relative-time helpers; `views/badges.tsx` is the one
badge/avatar shape every surface reuses.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount `GuiProvider` → `IamProvider` →
  `BaseProvider`, with the BaseClient carrying the IAM access token (rebuilt when
  the token changes, `src/lib/base.ts`). That seam makes every `useQuery`/
  `useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Status/severity render through one `Pill`.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND**:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`paddingHorizontal`/
  `borderRadius`/`textAlign`/`alignSelf` — NOT the `items`/`justify`/`bg`/`p`/
  `rounded`/`text`/`self` shorthands. Shorthands pass at runtime but FAIL `tsc`.
  `Button` uses `onPress` and accepts rich children + `hoverStyle`/`pressStyle`;
  `Input`/`TextArea` use `value`/`onChangeText`.
- **PKCE storage is `localStorage`** so the verifier/state survive the round-trip
  to hanzo.id.
- **`schema.sql` is the data contract** — the `databaseSchema` DDL the deploy
  translates into Base collections (`provisionBaseFromDDL`, rule
  `@request.auth.org_id = org`). Keep it in lockstep with `lib/tickets.ts` and
  the views.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app`. No server.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (`https://*.hanzo.app/auth/callback` wildcard, or a per-app
  `hanzo-<app>` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · renders under Vite with zero
console errors. CI (`.github/workflows/ci.yml`) runs `npm ci && npm run
typecheck && npm run build` — build-verification only, NEVER a container image
(Hanzo Cloud owns deploys; do not build images locally).
