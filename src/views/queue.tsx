import { useState } from 'react'
import { YStack, XStack, Text, Paragraph, Button, ScrollView } from '@hanzo/gui'
import {
  type Ticket,
  type Reply,
  STATUSES,
  priorityMeta,
  orderTickets,
  countByStatus,
  threadFor,
  tint,
  ago,
} from '../lib/tickets'
import { StatusBadge, PriorityBadge, Avatar } from './badges'

type Filter = 'all' | string

function FilterChip({
  label,
  count,
  active,
  color,
  onPress,
}: {
  label: string
  count: number
  active: boolean
  color: string
  onPress: () => void
}) {
  return (
    <Button
      size="$2"
      height={30}
      paddingHorizontal={11}
      borderRadius={999}
      borderWidth={1}
      borderColor={active ? tint(color, 'aa') : '$borderColor'}
      backgroundColor={active ? tint(color, '24') : 'transparent'}
      hoverStyle={{ backgroundColor: tint(color, '18'), borderColor: tint(color, '77') }}
      onPress={onPress}
    >
      <Text fontSize={13} fontWeight="700" color={active ? color : '$color11'}>
        {label} {count}
      </Text>
    </Button>
  )
}

/** One row in the queue — subject, severity, requester, status, reply count. */
function Row({
  ticket,
  replyCount,
  selected,
  onPress,
}: {
  ticket: Ticket
  replyCount: number
  selected: boolean
  onPress: () => void
}) {
  const pc = priorityMeta(ticket.priority).color
  return (
    <Button
      height="auto"
      padding={0}
      borderWidth={1}
      borderRadius={12}
      borderColor={selected ? tint(pc, 'aa') : '$borderColor'}
      backgroundColor={selected ? tint(pc, '14') : '#ffffff05'}
      hoverStyle={{ backgroundColor: selected ? tint(pc, '1c') : '#ffffff0c', borderColor: tint(pc, '55') }}
      pressStyle={{ backgroundColor: tint(pc, '1c') }}
      onPress={onPress}
    >
      <XStack alignItems="stretch" width="100%">
        <YStack width={4} borderTopLeftRadius={12} borderBottomLeftRadius={12} backgroundColor={pc} />
        <YStack flex={1} gap={8} paddingVertical={12} paddingHorizontal={13} overflow="hidden">
          <XStack alignItems="flex-start" justifyContent="space-between" gap={10}>
            <Text fontSize={15} fontWeight="700" color="$color12" numberOfLines={1} flex={1}>
              {ticket.subject || 'Untitled ticket'}
            </Text>
            <PriorityBadge priority={ticket.priority} size={11} />
          </XStack>
          <XStack alignItems="center" gap={8} flexWrap="wrap">
            <Avatar name={ticket.requester} size={22} color={pc} />
            <Text fontSize={12} color="$color11" numberOfLines={1} flex={1}>
              {ticket.requester || 'Unknown'}
            </Text>
            <StatusBadge status={ticket.status} size={11} />
          </XStack>
          <XStack alignItems="center" gap={10}>
            <Text fontSize={11} color="$color11" opacity={0.55}>
              {replyCount === 0 ? 'No replies' : `${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}`}
            </Text>
            <Text fontSize={11} color="$color11" opacity={0.4}>
              ·
            </Text>
            <Text fontSize={11} color="$color11" opacity={0.55}>
              {ago(ticket.created)}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Button>
  )
}

/**
 * The support queue: severity/status filter chips over a scrollable list of
 * tickets, ordered live-first then by severity then newest. Selecting a row
 * opens it in the detail pane.
 */
export function Queue({
  tickets,
  replies,
  selectedId,
  onSelect,
}: {
  tickets: Ticket[]
  replies: Reply[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const counts = countByStatus(tickets)
  const shown = orderTickets(filter === 'all' ? tickets : tickets.filter((t) => t.status === filter))

  return (
    <YStack gap="$3" width="100%">
      <XStack gap={7} flexWrap="wrap">
        <FilterChip label="All" count={tickets.length} color="#6366f1" active={filter === 'all'} onPress={() => setFilter('all')} />
        {STATUSES.map((s) => (
          <FilterChip
            key={s.key}
            label={s.label}
            count={counts[s.key] ?? 0}
            color={s.color}
            active={filter === s.key}
            onPress={() => setFilter(s.key)}
          />
        ))}
      </XStack>

      {shown.length === 0 ? (
        <YStack
          alignItems="center"
          justifyContent="center"
          gap="$2"
          paddingVertical="$7"
          paddingHorizontal="$4"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$6"
          backgroundColor="#ffffff05"
        >
          <Text fontSize={30}>🎫</Text>
          <Paragraph fontSize={14} fontWeight="700" color="$color12">
            {filter === 'all' ? 'Queue is clear' : 'Nothing here'}
          </Paragraph>
          <Paragraph fontSize={13} textAlign="center" opacity={0.55} maxWidth={260}>
            {filter === 'all'
              ? 'No tickets yet — open one with “New ticket”.'
              : 'No tickets match this filter.'}
          </Paragraph>
        </YStack>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} maxHeight={640}>
          <YStack gap="$2.5">
            {shown.map((t) => (
              <Row
                key={t.id}
                ticket={t}
                replyCount={threadFor(t.id, replies).length}
                selected={t.id === selectedId}
                onPress={() => onSelect(t.id)}
              />
            ))}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}
