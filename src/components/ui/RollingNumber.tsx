import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/dom'

interface RollingNumberProps {
  value: number
  pad?: number
  className?: string
  /** Applied to each digit, e.g. gradient text (background-clip can't reach animated children from the parent). */
  digitClassName?: string
}

/** A number whose digits roll like an odometer when they change. */
export function RollingNumber({ value, pad = 1, className, digitClassName }: RollingNumberProps) {
  const digits = String(value).padStart(pad, '0').split('')
  return (
    <span className={cn('inline-flex tabular-nums', className)}>
      <span className="sr-only">{value}</span>
      {digits.map((digit, i) => (
        // Keyed from the right so the ones digit keeps its slot when the number grows
        <Digit key={digits.length - i} digit={digit} className={digitClassName} />
      ))}
    </span>
  )
}

function Digit({ digit, className }: { digit: string; className?: string }) {
  return (
    <span aria-hidden className="relative inline-block overflow-hidden px-[0.03em] py-[0.06em]">
      <span className="invisible">{digit}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={digit}
          className={cn('absolute inset-0 px-[0.03em] py-[0.06em] text-center', className)}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
