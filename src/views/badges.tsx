import { XStack, YStack, Text } from '@hanzo/gui'
import { statusMeta, priorityMeta, tint, initials } from '../lib/tickets'

/**
 * A small rounded chip with a leading dot — the one badge shape the whole app
 * reuses (status, severity, and the signed-out preview all render through it).
 */
export function Pill({
  color,
  label,
  filled = false,
  size = 12,
}: {
  color: string
  label: string
  filled?: boolean
  size?: number
}) {
  const dot = Math.round(size * 0.58)
  return (
    <XStack
      alignItems="center"
      gap={6}
      paddingHorizontal={9}
      paddingVertical={3}
      borderRadius={999}
      borderWidth={1}
      borderColor={filled ? tint(color, 'aa') : tint(color, '55')}
      backgroundColor={tint(color, filled ? '2e' : '16')}
    >
      <YStack width={dot} height={dot} borderRadius={999} backgroundColor={color} />
      <Text fontSize={size} fontWeight="700" color={color}>
        {label}
      </Text>
    </XStack>
  )
}

/** Where a ticket sits in its lifecycle (Open · Pending · Resolved · Closed). */
export function StatusBadge({ status, size = 12 }: { status: string; size?: number }) {
  const m = statusMeta(status)
  return <Pill color={m.color} label={m.label} size={size} />
}

/** Severity — filled for extra weight so it reads first in a dense queue row. */
export function PriorityBadge({ priority, size = 12 }: { priority: string; size?: number }) {
  const m = priorityMeta(priority)
  return <Pill color={m.color} label={m.label} filled size={size} />
}

/** A round initials avatar for a requester or reply author. */
export function Avatar({
  name,
  color = '#6366f1',
  size = 34,
}: {
  name: string
  color?: string
  size?: number
}) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={999}
      backgroundColor={tint(color, '2e')}
      borderWidth={1}
      borderColor={tint(color, '55')}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={Math.round(size * 0.4)} fontWeight="800" color={color}>
        {initials(name)}
      </Text>
    </YStack>
  )
}
