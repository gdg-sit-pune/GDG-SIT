// Shared class strings (kept out of component files so hot reload works).

const buttonVariants = {
  primary: 'bg-fg text-bg hover:bg-g-blue hover:text-white',
  secondary: 'border border-line-strong text-fg hover:border-fg',
}

const buttonSizes = {
  md: 'h-11 px-5 text-sm',
  sm: 'h-9 px-4 text-sm',
}

export type ButtonVariant = keyof typeof buttonVariants
export type ButtonSize = keyof typeof buttonSizes

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return `group/btn inline-flex items-center justify-center gap-2 rounded-xs font-medium whitespace-nowrap active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue ${buttonVariants[variant]} ${buttonSizes[size]}`
}

/**
 * Bordered grid cells that share their borders.
 * Put `cellGrid` on the grid and `cell` on each child.
 */
export const cellGrid = 'grid pt-px pl-px'
export const cell = '-mt-px -ml-px border border-line'

/** Text inputs, selects and textareas, without spacing */
export const fieldBase =
  'w-full rounded-xs border border-line-strong bg-bg px-4 text-base outline-none placeholder:text-muted focus:border-fg disabled:opacity-60'

/** Same, with space above for use under a label */
export const fieldClass = `mt-2 ${fieldBase}`
