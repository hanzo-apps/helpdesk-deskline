import { YStack, XStack } from '@hanzo/gui'

/**
 * The Deskline mark: three stacked queue rows of decreasing width with a single
 * severity dot on top — a triage list in miniature. Businesslike, not playful.
 */
export function Logo({ size = 30 }: { size?: number }) {
  const pad = size * 0.24
  const rowH = Math.max(size * 0.12, 2)
  const gap = size * 0.13
  const track = size - pad * 2
  const rows = [1, 0.7, 0.44]
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size / 3.4}
      backgroundColor="#6366f1"
      justifyContent="center"
      paddingHorizontal={pad}
      gap={gap}
      overflow="hidden"
    >
      {rows.map((w, i) => (
        <XStack key={i} alignItems="center" gap={gap} height={rowH}>
          <YStack height={rowH} width={track * w * (i === 0 ? 0.66 : 1)} borderRadius={999} backgroundColor="#ffffffe6" />
          {i === 0 ? <YStack width={rowH} height={rowH} borderRadius={999} backgroundColor="#f97316" /> : null}
        </XStack>
      ))}
    </YStack>
  )
}
