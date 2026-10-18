import type { SelectHTMLAttributes } from 'react'
import { fieldBase } from '@/lib/styles'
import { CaretDown } from './icons'

/** Dropdown with our own chevron, sitting inside the box instead of the browser's default arrow. */
export default function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative mt-2 block">
      <select {...props} className={`${fieldBase} h-12 appearance-none pr-11 ${className}`}>
        {children}
      </select>
      <CaretDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
      />
    </span>
  )
}
