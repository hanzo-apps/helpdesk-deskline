import type { BaseRecord } from '@hanzo/base/react'

/**
 * The two org-scoped Base collections behind Deskline (see schema.sql). Base
 * adds id/created/updated/owner/org; these are the domain columns the app
 * reads and writes.
 */
export interface Ticket extends BaseRecord {
  subject: string
  body: string
  status: string // StatusKey
  priority: string // PriorityKey
  requester: string
}
export interface Reply extends BaseRecord {
  ticket: string // the Ticket.id this reply belongs to
  body: string
  author: string
}

export type StatusKey = 'open' | 'pending' | 'resolved' | 'closed'
export type PriorityKey = 'urgent' | 'high' | 'normal' | 'low'

export interface StatusMeta {
  key: StatusKey
  label: string
  color: string
}
export interface PriorityMeta {
  key: PriorityKey
  label: string
  color: string
  rank: number
}

/** Ticket lifecycle — the order the queue filters and triage buttons render in. */
export const STATUSES: readonly StatusMeta[] = [
  { key: 'open', label: 'Open', color: '#6366f1' },
  { key: 'pending', label: 'Pending', color: '#f59e0b' },
  { key: 'resolved', label: 'Resolved', color: '#10b981' },
  { key: 'closed', label: 'Closed', color: '#64748b' },
]

/** Severity — rank drives queue ordering (0 = most severe, floats to the top). */
export const PRIORITIES: readonly PriorityMeta[] = [
  { key: 'urgent', label: 'Urgent', color: '#ef4444', rank: 0 },
  { key: 'high', label: 'High', color: '#f97316', rank: 1 },
  { key: 'normal', label: 'Normal', color: '#0ea5e9', rank: 2 },
  { key: 'low', label: 'Low', color: '#64748b', rank: 3 },
]

export const DEFAULT_STATUS: StatusKey = 'open'
export const DEFAULT_PRIORITY: PriorityKey = 'normal'

const STATUS_BY = new Map(STATUSES.map((s) => [s.key, s]))
const PRIORITY_BY = new Map(PRIORITIES.map((p) => [p.key, p]))

export function statusMeta(key: string): StatusMeta {
  return STATUS_BY.get(key as StatusKey) ?? STATUSES[0]
}
export function priorityMeta(key: string): PriorityMeta {
  return PRIORITY_BY.get(key as PriorityKey) ?? PRIORITIES[2]
}

/** open + pending are the live queue; resolved + closed are done. */
export function isLive(status: string): boolean {
  return status === 'open' || status === 'pending'
}

/** A translucent tint of a 6-digit hex color (hex8) for chip and badge fills. */
export function tint(hex: string, alpha = '26'): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${alpha}` : hex
}

/** Up-to-two-letter initials for a requester or author avatar. */
export function initials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** ISO timestamp → compact "now · 5m · 3h · 2d · Mar 4" relative label. */
export function ago(iso?: string): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (s < 45) return 'now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Queue order: live tickets before done, then by severity, then newest first. */
export function orderTickets(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    const liveA = isLive(a.status) ? 0 : 1
    const liveB = isLive(b.status) ? 0 : 1
    if (liveA !== liveB) return liveA - liveB
    const pr = priorityMeta(a.priority).rank - priorityMeta(b.priority).rank
    if (pr !== 0) return pr
    return (b.created ?? '').localeCompare(a.created ?? '')
  })
}

/** Count of tickets per status key, for the filter chips. */
export function countByStatus(tickets: Ticket[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of tickets) out[t.status] = (out[t.status] ?? 0) + 1
  return out
}

/** The replies belonging to a ticket, oldest first (thread order). */
export function threadFor(ticketId: string, replies: Reply[]): Reply[] {
  return replies
    .filter((r) => r.ticket === ticketId)
    .sort((a, b) => (a.created ?? '').localeCompare(b.created ?? ''))
}
