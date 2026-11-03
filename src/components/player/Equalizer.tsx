import { cn } from '../../lib/dom'

/** Four bouncing bars. Paused bars freeze mid-bounce, like a frozen meter. */
export function Equalizer({ active, className }: { active: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn('eq', className)} data-paused={!active}>
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}
