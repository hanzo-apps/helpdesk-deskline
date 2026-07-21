import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Button, Spinner } from '@hanzo/gui'
import { type Ticket, type Reply } from '../lib/tickets'
import { Logo } from './brand'
import { Queue } from './queue'
import { Detail } from './detail'
import { Compose } from './compose'

function EmptyPane({ hasTickets }: { hasTickets: boolean }) {
  return (
    <YStack
      flex={1}
      minHeight={360}
      alignItems="center"
      justifyContent="center"
      gap="$3"
      padding="$8"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$7"
      backgroundColor="#ffffff05"
    >
      <Text fontSize={38}>🗂️</Text>
      <Text fontSize={17} fontWeight="800" color="$color12">
        {hasTickets ? 'Select a ticket' : 'No tickets yet'}
      </Text>
      <Paragraph fontSize={14} textAlign="center" opacity={0.55} maxWidth={340}>
        {hasTickets
          ? 'Pick a request from the queue to read it, reply, and set its status and severity.'
          : 'Open your first support request with “New ticket” — it lands in the queue as Open.'}
      </Paragraph>
    </YStack>
  )
}

/** Signed-in shell: brand bar + a split queue / detail workspace over Base. */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'Agent'

  const ticketsQ = useQuery<Ticket>('tickets', { sort: '-created', realtime: false })
  const repliesQ = useQuery<Reply>('replies', { sort: 'created', realtime: false })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<'view' | 'new'>('view')

  const refetchAll = () => {
    ticketsQ.refetch()
    repliesQ.refetch()
  }

  const loading = ticketsQ.isLoading || repliesQ.isLoading
  const error = ticketsQ.error || repliesQ.error
  const selected = selectedId ? ticketsQ.data.find((t) => t.id === selectedId) ?? null : null

  const openNew = () => {
    setSelectedId(null)
    setMode('new')
  }
  const select = (id: string) => {
    setSelectedId(id)
    setMode('view')
  }

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      {/* Brand + actions bar */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap="$4"
        paddingHorizontal="$5"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderColor="$borderColor"
        flexWrap="wrap"
      >
        <XStack alignItems="center" gap="$3">
          <Logo />
          <YStack>
            <Text fontSize={18} fontWeight="900" color="$color12">
              Deskline
            </Text>
            <Text fontSize={11} color="$color11" opacity={0.6}>
              Support desk
            </Text>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap="$2">
          <Button size="$3" theme="active" onPress={openNew}>
            + New ticket
          </Button>
          <Button size="$3" chromeless onPress={() => logout()}>
            Sign out
          </Button>
        </XStack>
      </XStack>

      {/* Workspace */}
      <YStack padding="$5" gap="$4" maxWidth={1240} width="100%" alignSelf="center">
        <Paragraph fontSize={13} opacity={0.5}>
          Signed in as {who}
        </Paragraph>

        {loading ? (
          <XStack gap="$2" alignItems="center" justifyContent="center" opacity={0.6} paddingVertical="$8">
            <Spinner /> <Text>Loading queue…</Text>
          </XStack>
        ) : error ? (
          <Paragraph color="$red10">
            Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
          </Paragraph>
        ) : (
          <XStack gap="$5" flexWrap="wrap" alignItems="flex-start">
            <YStack flexGrow={1} flexBasis={344} minWidth={288} maxWidth={460}>
              <Queue tickets={ticketsQ.data} replies={repliesQ.data} selectedId={selectedId} onSelect={select} />
            </YStack>
            <YStack flexGrow={2} flexBasis={460} minWidth={320}>
              {mode === 'new' ? (
                <Compose
                  currentUser={who}
                  onCreated={(id) => {
                    select(id)
                    refetchAll()
                  }}
                  onCancel={() => setMode('view')}
                />
              ) : selected ? (
                <Detail
                  ticket={selected}
                  replies={repliesQ.data}
                  currentUser={who}
                  refetch={refetchAll}
                  onBack={() => setSelectedId(null)}
                />
              ) : (
                <EmptyPane hasTickets={ticketsQ.data.length > 0} />
              )}
            </YStack>
          </XStack>
        )}
      </YStack>
    </YStack>
  )
}
