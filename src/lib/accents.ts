// Tailwind needs full class names written out, so each Google color gets a fixed set.
// `text` uses the softer "ink" tones (readable in both themes); `bg` is the bright brand color.

export type Accent = 'blue' | 'red' | 'yellow' | 'green'

export const accents: Record<Accent, { text: string; bg: string }> = {
  blue: { text: 'text-ink-blue', bg: 'bg-g-blue' },
  red: { text: 'text-ink-red', bg: 'bg-g-red' },
  yellow: { text: 'text-ink-yellow', bg: 'bg-g-yellow' },
  green: { text: 'text-ink-green', bg: 'bg-g-green' },
}

const order: Accent[] = ['blue', 'red', 'yellow', 'green']

/** Cycle through the four colors by index. */
export const accentAt = (i: number): Accent => order[i % order.length]
