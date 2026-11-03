import { motion } from 'framer-motion'
import { cn } from '../../lib/dom'
import { reveal } from '../../lib/motion'

interface SectionHeadingProps {
  index: string
  kicker: string
  /** Set in heavy uppercase sans. */
  title: string
  /** The italic serif line underneath. */
  accent: string
  align?: 'left' | 'center'
}

/** "02 — SIDE B / THE TRACKLIST / eight songs, one story." */
export function SectionHeading({ index, kicker, title, accent, align = 'left' }: SectionHeadingProps) {
  return (
    <motion.header {...reveal} className={cn(align === 'center' && 'text-center')}>
      <p className="eyebrow">
        <span className="text-amber">{index}</span> — {kicker}
      </p>
      <h2 className="mt-4 text-[clamp(2.5rem,10vw,5.6rem)] leading-[0.88] font-semibold tracking-[-0.03em] uppercase">{title}</h2>
      <p className="font-display text-[clamp(2.2rem,9vw,4.8rem)] leading-[0.95] text-love italic">{accent}</p>
    </motion.header>
  )
}
