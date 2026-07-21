import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, H2, Text, Paragraph, Button, Input, TextArea } from '@hanzo/gui'
import { PRIORITIES, DEFAULT_STATUS, DEFAULT_PRIORITY, tint } from '../lib/tickets'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <YStack gap={7}>
      <Text fontSize={11} fontWeight="800" letterSpacing={0.6} color="$color11" opacity={0.6}>
        {label}
      </Text>
      {children}
    </YStack>
  )
}

/**
 * New-ticket composer: subject, description, severity, and who is requesting.
 * Creates an org-scoped `tickets` row (status Open) and hands the new id back so
 * the shell selects it in the detail pane.
 */
export function Compose({
  currentUser,
  onCreated,
  onCancel,
}: {
  currentUser: string
  onCreated: (id: string) => void
  onCancel: () => void
}) {
  const create = useMutation('tickets', 'create')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<string>(DEFAULT_PRIORITY)
  const [requester, setRequester] = useState(currentUser)

  const ready = subject.trim().length > 0 && requester.trim().length > 0

  async function submit() {
    if (!ready || create.isLoading) return
    const rec = await create.mutate({
      subject: subject.trim(),
      body: body.trim(),
      status: DEFAULT_STATUS,
      priority,
      requester: requester.trim(),
    })
    if (rec) onCreated(rec.id)
  }

  return (
    <YStack
      gap="$4"
      padding="$5"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$7"
      backgroundColor="#ffffff06"
      width="100%"
    >
      <YStack gap="$1">
        <H2 fontSize="$8" color="$color12">
          New ticket
        </H2>
        <Paragraph fontSize={13.5} opacity={0.55}>
          Log a support request. It lands in the queue as Open.
        </Paragraph>
      </YStack>

      <Field label="SUBJECT">
        <Input value={subject} placeholder="Short summary of the problem" onChangeText={setSubject} />
      </Field>

      <Field label="DESCRIPTION">
        <TextArea
          value={body}
          placeholder="What happened? Steps to reproduce, error messages, links…"
          onChangeText={setBody}
          minHeight={128}
        />
      </Field>

      <Field label="SEVERITY">
        <XStack gap={7} flexWrap="wrap">
          {PRIORITIES.map((p) => {
            const on = p.key === priority
            return (
              <Button
                key={p.key}
                size="$2"
                height={32}
                paddingHorizontal={13}
                borderRadius={999}
                borderWidth={1}
                borderColor={on ? tint(p.color, 'cc') : '$borderColor'}
                backgroundColor={on ? tint(p.color, '30') : 'transparent'}
                hoverStyle={{ backgroundColor: tint(p.color, '1c'), borderColor: tint(p.color, '77') }}
                onPress={() => setPriority(p.key)}
              >
                <XStack alignItems="center" gap={7}>
                  <YStack width={8} height={8} borderRadius={999} backgroundColor={p.color} />
                  <Text fontSize={13} fontWeight="700" color={on ? p.color : '$color11'}>
                    {p.label}
                  </Text>
                </XStack>
              </Button>
            )
          })}
        </XStack>
      </Field>

      <Field label="REQUESTER">
        <Input value={requester} placeholder="Who is reporting this?" onChangeText={setRequester} />
      </Field>

      {create.error ? <Paragraph color="$red10">{create.error.message}</Paragraph> : null}

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Button theme="active" disabled={!ready || create.isLoading} onPress={submit}>
          {create.isLoading ? 'Creating…' : 'Create ticket'}
        </Button>
        <Button chromeless onPress={onCancel}>
          Cancel
        </Button>
      </XStack>
    </YStack>
  )
}
