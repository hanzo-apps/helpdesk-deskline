import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, Text, Button } from '@hanzo/gui'
import { Logo } from './brand'
import { statusMeta, priorityMeta, tint, initials } from '../lib/tickets'

/** A sample ticket for the illustrative preview (not live data). */
interface Sample {
  subject: string
  requester: string
  status: string
  priority: string
  replies: number
  age: string
}

const SAMPLES: Sample[] = [
  { subject: 'Checkout returns 500 on Safari', requester: 'Mia Chen', status: 'open', priority: 'urgent', replies: 0, age: '4m' },
  { subject: 'SSO redirect loops after logout', requester: 'Dev Kapoor', status: 'open', priority: 'high', replies: 2, age: '38m' },
  { subject: 'Export CSV missing last column', requester: 'Ana Ruiz', status: 'pending', priority: 'normal', replies: 1, age: '2h' },
  { subject: 'Add dark mode to the dashboard', requester: 'Sam Poole', status: 'resolved', priority: 'low', replies: 4, age: '1d' },
]

const PANEL = '#0c0c13'
const LINE = '#ffffff14'
const SUB = '#c7c7d1'

function MiniBadge({ color, label, filled }: { color: string; label: string; filled?: boolean }) {
  return (
    <XStack
      alignItems="center"
      gap={5}
      paddingHorizontal={8}
      paddingVertical={2}
      borderRadius={999}
      borderWidth={1}
      borderColor={filled ? tint(color, 'aa') : tint(color, '55')}
      backgroundColor={tint(color, filled ? '2e' : '16')}
    >
      <YStack width={6} height={6} borderRadius={999} backgroundColor={color} />
      <Text fontSize={10.5} fontWeight="700" color={color}>
        {label}
      </Text>
    </XStack>
  )
}

function MiniAvatar({ name, color }: { name: string; color: string }) {
  return (
    <YStack width={20} height={20} borderRadius={999} backgroundColor={tint(color, '2e')} borderWidth={1} borderColor={tint(color, '55')} alignItems="center" justifyContent="center">
      <Text fontSize={9} fontWeight="800" color={color}>
        {initials(name)}
      </Text>
    </YStack>
  )
}

function QueueRow({ s, active }: { s: Sample; active?: boolean }) {
  const pc = priorityMeta(s.priority).color
  const sc = statusMeta(s.status).color
  return (
    <XStack borderWidth={1} borderRadius={10} borderColor={active ? tint(pc, 'aa') : LINE} backgroundColor={active ? tint(pc, '16') : '#ffffff06'} overflow="hidden">
      <YStack width={3} backgroundColor={pc} />
      <YStack flex={1} gap={6} paddingVertical={9} paddingHorizontal={11}>
        <XStack alignItems="center" justifyContent="space-between" gap={8}>
          <Text fontSize={12.5} fontWeight="700" color="#f4f4f8" numberOfLines={1} flex={1}>
            {s.subject}
          </Text>
          <MiniBadge color={pc} label={priorityMeta(s.priority).label} filled />
        </XStack>
        <XStack alignItems="center" gap={7}>
          <MiniAvatar name={s.requester} color={pc} />
          <Text fontSize={11} color={SUB} numberOfLines={1} flex={1}>
            {s.requester}
          </Text>
          <MiniBadge color={sc} label={statusMeta(s.status).label} />
        </XStack>
      </YStack>
    </XStack>
  )
}

/** A faithful mini rendering of the split queue + detail, using the app's badges. */
function Preview() {
  const hero = SAMPLES[1]
  const pc = priorityMeta(hero.priority).color
  return (
    <YStack borderWidth={1} borderColor="#ffffff1c" borderRadius={16} overflow="hidden" backgroundColor={PANEL}>
      {/* faux toolbar */}
      <XStack alignItems="center" justifyContent="space-between" gap="$3" paddingHorizontal={14} paddingVertical={11} borderBottomWidth={1} borderColor={LINE} backgroundColor="#ffffff06">
        <XStack alignItems="center" gap={9}>
          <Logo size={22} />
          <Text fontSize={13} fontWeight="900" color="#f4f4f8">
            Deskline
          </Text>
        </XStack>
        <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={5} borderRadius={999} backgroundColor="#6366f1">
          <Text fontSize={11} fontWeight="800" color="#ffffff">
            + New ticket
          </Text>
        </XStack>
      </XStack>

      {/* split body */}
      <XStack gap={12} padding={12} alignItems="flex-start" flexWrap="wrap">
        <YStack gap={8} flexGrow={1} flexBasis={210} minWidth={190}>
          {SAMPLES.map((s, i) => (
            <QueueRow key={s.subject} s={s} active={i === 1} />
          ))}
        </YStack>

        <YStack gap={11} flexGrow={2} flexBasis={250} minWidth={220} padding={14} borderRadius={12} borderWidth={1} borderColor={LINE} borderLeftWidth={3} borderLeftColor={pc} backgroundColor={tint(pc, '10')}>
          <XStack gap={7} alignItems="center">
            <MiniBadge color={pc} label={priorityMeta(hero.priority).label} filled />
            <MiniBadge color={statusMeta(hero.status).color} label={statusMeta(hero.status).label} />
          </XStack>
          <Text fontSize={16} fontWeight="800" color="#f4f4f8" numberOfLines={2}>
            {hero.subject}
          </Text>
          <XStack alignItems="center" gap={8}>
            <MiniAvatar name={hero.requester} color={pc} />
            <Text fontSize={11.5} color={SUB}>
              {hero.requester} · opened {hero.age}
            </Text>
          </XStack>
          <YStack height={1} backgroundColor={LINE} />
          <XStack gap={9} alignItems="flex-start">
            <MiniAvatar name="Riley Ops" color={pc} />
            <YStack flex={1} gap={2}>
              <Text fontSize={11.5} fontWeight="700" color="#f4f4f8">
                Riley Ops
              </Text>
              <Text fontSize={11.5} color={SUB} numberOfLines={2}>
                Reproduced it — the callback drops the state param. Patch is in review, moving you to Pending.
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </XStack>
    </YStack>
  )
}

function FeatureChip({ children }: { children: string }) {
  return (
    <XStack alignItems="center" gap={7} paddingHorizontal={12} paddingVertical={7} borderRadius={999} borderWidth={1} borderColor="$borderColor" backgroundColor="#ffffff06">
      <Text fontSize={13} color="$color12">
        {children}
      </Text>
    </XStack>
  )
}

/**
 * Signed-out landing — the honest public view (the queue itself needs sign-in).
 * One action: PKCE sign-in with Hanzo (hanzo.id); no local credential form.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" padding="$6" backgroundColor="$background">
      <XStack maxWidth={1140} width="100%" gap="$8" flexWrap="wrap" alignItems="center" justifyContent="center">
        {/* Copy + CTA */}
        <YStack flex={1} minWidth={340} gap="$5" paddingVertical="$4">
          <XStack alignItems="center" gap="$3">
            <Logo size={38} />
            <YStack>
              <Text fontSize={22} fontWeight="900" color="$color12">
                Deskline
              </Text>
              <Text fontSize={12} color="$color11" opacity={0.6}>
                Support desk
              </Text>
            </YStack>
          </XStack>

          <H1 fontSize={46} lineHeight={50} fontWeight="900" color="$color12">
            Every support ticket, triaged and answered.
          </H1>

          <Paragraph fontSize={17} lineHeight={26} opacity={0.7} maxWidth={520}>
            A businesslike helpdesk queue for your team. Log requests, sort them by
            severity, and work each one in a split list-and-detail view — reply,
            set status, resolve. Nothing to configure.
          </Paragraph>

          <XStack gap="$2" flexWrap="wrap">
            <FeatureChip>Severity triage</FeatureChip>
            <FeatureChip>Threaded replies</FeatureChip>
            <FeatureChip>Status workflow</FeatureChip>
          </XStack>

          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <Button size="$5" theme="active" disabled={isLoading} onPress={() => login()}>
              {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
            </Button>
            <Text fontSize={13} opacity={0.5}>
              Tickets stored per-org in Hanzo Base.
            </Text>
          </XStack>
        </YStack>

        {/* Illustrative preview */}
        <YStack flex={1} minWidth={380} gap="$2" paddingVertical="$4">
          <Text fontSize={11} fontWeight="800" color="$color11" opacity={0.5} letterSpacing={1}>
            PREVIEW
          </Text>
          <Preview />
        </YStack>
      </XStack>
    </YStack>
  )
}
