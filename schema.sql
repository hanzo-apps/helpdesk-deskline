-- Hanzo Base schema for Deskline — the `databaseSchema` DDL.
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- id/created/updated/owner/org itself, so they are never re-declared here.
-- Every row is stamped with the verified IAM owner+org and is org-scoped: Base
-- applies the list/view/create/update/delete rule `@request.auth.org_id = org`,
-- so a member of your org reads/writes the row and other orgs cannot see it.
--
-- Keep this in lockstep with what the app reads/writes
-- (src/lib/tickets.ts + src/views/queue.tsx · detail.tsx · compose.tsx).

-- Support tickets — the rows in the queue.
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject   TEXT NOT NULL,
  body      TEXT NOT NULL DEFAULT '',
  status    TEXT NOT NULL DEFAULT 'open',    -- open | pending | resolved | closed
  priority  TEXT NOT NULL DEFAULT 'normal',  -- urgent | high | normal | low
  requester TEXT NOT NULL DEFAULT ''
);

-- Replies — the conversation thread on a ticket (replies.ticket = tickets.id).
CREATE TABLE IF NOT EXISTS replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket TEXT NOT NULL,
  body   TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT ''
);
