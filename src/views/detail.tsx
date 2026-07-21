import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, H2, Text, Paragraph, Button, TextArea, Separator, ScrollView } from '@hanzo/gui'
import {
  type Ticket,
  type Reply,
  STATUSES,
  PRIORITIES,
  statusMeta,
  priorityMeta,
  threadFor,
  tint,
  ago,
} from '../lib/tickets'
import { StatusBadge, PriorityBadge, Avatar } from './badges'

/** A labelled row of segmented pills used for both status and priority triage. */
function Segments({
  label,
  options,
  value,
  disabled,
  onPick,
}: {
  label: string
  options: readonly { key: string; label: string; color: string }[]
  value: string
  disabled: boolean
  onPick: (key: string) => void
}) {
  return (
    <YStack gap={7} flex={1} minWidth={220}>
      <Text fontSize={11} fontWeight="800" letterSpacing={0.6} color="$color11" opacity={0.6}>
        {label}
      </Text>
      <XStack gap={6} flexWrap="wrap">
        {options.map((o) => {
          const on = o.key === value
          return (
            <Button
              key={o.key}
              size="$2"
              height={30}
              paddingHorizontal={12}
              borderRadius={999}
              disabled={disabled}
              borderWidth={1}
              borderColor={on ? tint(o.color, 'cc') : '$borderColor'}
              backgroundColor={on ? tint(o.color, '30') : 'transparent'}
              hoverStyle={{ backgroundColor: tint(o.color, '1c'), borderColor: tint(o.color, '77') }}
              onPress={() => onPick(o.key)}
            >
              <Text fontSize={12.5} fontWeight="700" color={on ? o.color : '$color11'}>
                {o.label}
              </Text>
            </Button>
          )
        })}
      </XStack>
    </YStack>
  )
}

/** One message in the ticket thread. */
function ReplyRow({ reply, color }: { reply: Reply; color: string }) {
  return (
    <XStack gap={11} alignItems="flex-start">
      <Avatar name={reply.author} size={32} color={color} />
      <YStack flex={1} gap={3}>
        <XStack alignItems="center" gap={8}>
          <Text fontSize={13.5} fontWeight="700" color="$color12">
            {reply.author || 'Agent'}
          </Text>
          <Text fontSize={11.5} color="$color11" opacity={0.5}>
            {ago(reply.created)}
          </Text>
        </XStack>
        <Paragraph fontSize={14} lineHeight={21} color="$color12" opacity={0.92}>
          {reply.body}
        </Paragraph>
      </YStack>
    </XStack>
  )
}

/**
 * Ticket detail: the request itself, one-tap triage of status and severity, the
 * full reply thread, and a composer. Every write is an org-scoped Base mutation
 * (tickets.update / replies.create) followed by a refetch so the queue tracks it.
 */
export function Detail({
  ticket,
  replies,
  currentUser,
  refetch,
  onBack,
}: {
  ticket: Ticket
  replies: Reply[]
  currentUser: string
  refetch: () => void
  onBack: () => void
}) {
  const update = useMutation('tickets', 'update')
  const addReply = useMutation('replies', 'create')
  const [draft, setDraft] = useState('')

  const sc = statusMeta(ticket.status).color
  const pc = priorityMeta(ticket.priority).color
  const thread = threadFor(ticket.id, replies)

  async function setField(patch: Partial<Pick<Ticket, 'status' | 'priority'>>) {
    if (update.isLoading) return
    await update.mutate({ id: ticket.id, ...patch })
    refetch()
  }

  async function send() {
    const body = draft.trim()
    if (!body || addReply.isLoading) return
    await addReply.mutate({ ticket: ticket.id, body, author: currentUser })
    // The first agent reply on a still-Open ticket moves it to Pending.
    if (ticket.status === 'open') await update.mutate({ id: ticket.id, status: 'pending' })
    setDraft('')
    refetch()
  }

  return (
    <YStack
      gap="$4"
      padding="$5"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$7"
      backgroundColor="#ffffff06"
      borderLeftWidth={4}
      borderLeftColor={pc}
      width="100%"
    >
      <XStack alignSelf="flex-start">
        <Button size="$2" chromeless paddingHorizontal={0} onPress={onBack}>
          <Text fontSize={13} color="$color11">
            ← Queue
          </Text>
        </Button>
      </XStack>

      <YStack gap="$3">
        <XStack gap="$2" flexWrap="wrap" alignItems="center">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </XStack>
        <H2 fontSize="$8" color="$color12">
          {ticket.subject || 'Untitled ticket'}
        </H2>
        <XStack alignItems="center" gap={10}>
          <Avatar name={ticket.requester} size={30} color={pc} />
          <Text fontSize={13.5} color="$color11">
            {ticket.requester || 'Unknown requester'}
          </Text>
          <Text fontSize={12.5} color="$color11" opacity={0.5}>
            opened {ago(ticket.created)}
          </Text>
        </XStack>
      </YStack>

      <YStack
        padding="$4"
        borderRadius="$5"
        backgroundColor={tint(pc, '10')}
        borderWidth={1}
        borderColor={tint(pc, '2e')}
      >
        <Paragraph fontSize={15} lineHeight={23} color="$color12">
          {ticket.body?.trim() || 'No description provided.'}
        </Paragraph>
      </YStack>

      <XStack
        gap="$4"
        flexWrap="wrap"
        padding="$3.5"
        borderRadius="$5"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="#ffffff05"
      >
        <Segments label="STATUS" options={STATUSES} value={ticket.status} disabled={update.isLoading} onPick={(status) => setField({ status })} />
        <Segments label="SEVERITY" options={PRIORITIES} value={ticket.priority} disabled={update.isLoading} onPick={(priority) => setField({ priority })} />
      </XStack>
      {update.error ? <Paragraph color="$red10">{update.error.message}</Paragraph> : null}

      <Separator />

      <YStack gap="$3">
        <XStack alignItems="center" gap={8}>
          <Text fontSize={12} fontWeight="800" letterSpacing={0.6} color="$color11" opacity={0.6}>
            CONVERSATION
          </Text>
          <YStack
            paddingHorizontal={7}
            paddingVertical={1}
            borderRadius={999}
            backgroundColor={tint(sc, '24')}
          >
            <Text fontSize={11} fontWeight="700" color={sc}>
              {thread.length}
            </Text>
          </YStack>
        </XStack>

        {thread.length === 0 ? (
          <Paragraph fontSize={13.5} opacity={0.55}>
            No replies yet — send the first response below.
          </Paragraph>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} maxHeight={320}>
            <YStack gap="$3.5">
              {thread.map((r) => (
                <ReplyRow key={r.id} reply={r} color={pc} />
              ))}
            </YStack>
          </ScrollView>
        )}
      </YStack>

      <YStack gap="$2.5">
        <TextArea
          value={draft}
          placeholder={`Reply as ${currentUser}…`}
          onChangeText={setDraft}
          minHeight={84}
        />
        <XStack alignItems="center" justifyContent="space-between" gap="$3" flexWrap="wrap">
          <Text fontSize={12} opacity={0.5}>
            Replies are visible to your org only.
          </Text>
          <Button theme="active" disabled={!draft.trim() || addReply.isLoading} onPress={send}>
            {addReply.isLoading ? 'Sending…' : 'Send reply'}
          </Button>
        </XStack>
        {addReply.error ? <Paragraph color="$red10">{addReply.error.message}</Paragraph> : null}
      </YStack>
    </YStack>
  )
}
